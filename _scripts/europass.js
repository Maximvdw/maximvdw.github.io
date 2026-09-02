import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import puppeteer from "puppeteer";

const DEBUG = process.env.DEBUG === "1" || process.env.DEBUG === "true"; // headed browser for local debugging
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const delay = 8000;    // Should not need this
const maxAttempts = Math.max(1, parseInt(process.env.ATTEMPTS || "3", 10)); // full-flow retries
const retryWaitMs = 15000;      // pause between attempts
const defaultTimeout = 120000;  // ms, per-selector/page action timeout

const prepare = async (page) => {
    try {
        // Perform a GET request to retrieve cookies
        await page.goto(
            "https://europa.eu/europass/eportfolio/screen/cv-editor?lang=en",
            { waitUntil: "networkidle2", timeout: 90000 }
        );

        // Wait for the wizard to render (also lets the session cookies get set)
        await page.waitForSelector("eportfolio-wizard-action-button");

        // The CV preview is rendered client-side (PDF.js). The app's Save step
        // can be left in a broken state (POST /cv/undefined -> 500) which keeps
        // the "Download" button permanently disabled, so we capture the PDF Blob
        // the app generates and pull its bytes directly instead of relying on
        // the (possibly disabled) download button.
        await page.evaluate(() => {
            window.__pdfBlobs = [];
            const note = (blob) => {
                try { if (blob && (blob.type || "").includes("pdf")) window.__pdfBlobs.push({ type: blob.type, size: blob.size, blob }); } catch (e) {}
            };
            const OrigBlob = window.Blob;
            window.Blob = function (parts, opts) {
                const b = new OrigBlob(parts, opts);
                note(b);
                return b;
            };
            window.Blob.prototype = OrigBlob.prototype;
            const origCreate = URL.createObjectURL;
            URL.createObjectURL = function (blob) {
                note(blob);
                return origCreate.call(this, blob);
            };
        });

        const cookies = await page.cookies();
        const xsrfCookie = cookies.find((cookie) => cookie.name === "XSRF-TOKEN");

        if (!xsrfCookie) {
            throw new Error("XSRF-TOKEN cookie not found");
        }
    } catch (error) {
        console.error("Error in prepare step:", error);
        throw error;
    }
};

const upload = async (file, page) => {
    try {
        // Click on eportfolio-wizard-action-button button
        await page.waitForSelector("eportfolio-wizard-action-button");
        console.log('\tClicking on "Start from Europass CV" button...');
        await page.evaluate(() => {
            document
                .querySelectorAll("eportfolio-wizard-action-button button")[1]
                .click();
        });

        // Upload file to eui-file-upload
        await page.waitForSelector("eui-file-upload");
        console.log("\tUpload XML file...");
        const input = await page.$('input[type="file"]');
        const [fileChooser] = await Promise.all([
            page.waitForFileChooser(),
            input.click(),
        ]);
        await fileChooser.accept([file]);

        // Wait until the XML has been uploaded and the builder choice is enabled
        console.log('\tWaiting for the builder choice to become available ...');
        await page.waitForFunction(
            () => {
                const b = document.querySelector("#select-legacy-editor-btn button");
                return b !== null && !b.disabled;
            },
            { timeout: 120000 }
        );

        // Click "Use the standard CV builder" so the CV opens in the legacy editor
        console.log('\tClicking on "Use the standard CV builder" button...');
        await selectStandardBuilder(page);
    } catch (error) {
        console.error("Error uploading the CV XML:", error);
        throw error;
    }
};

const selectStandardBuilder = async (page) => {
    // Duplicate #select-legacy-editor-btn ids live in hidden template dialogs, so
    // document.querySelector would grab the wrong one. Click the button inside the
    // ACTIVE overlay (the CDK overlay whose backdrop is currently "showing").
    const result = await page.evaluate(() => {
        const find = () => {
            for (const w of document.querySelectorAll(".cdk-global-overlay-wrapper")) {
                const prev = w.previousElementSibling;
                if (prev && prev.classList.contains("cdk-overlay-backdrop-showing")) {
                    const b = w.querySelector("#select-legacy-editor-btn button") || w.querySelector("#select-legacy-editor-btn");
                    if (b) return b;
                }
            }
            return document.querySelector("#select-legacy-editor-btn button") || document.querySelector("#select-legacy-editor-btn");
        };
        const btn = find();
        if (!btn) return "no-button";
        const opts = { bubbles: true, cancelable: true, view: window, button: 0 };
        for (const t of ["pointerdown", "mousedown", "pointerup", "mouseup", "click"]) {
            btn.dispatchEvent(new MouseEvent(t, opts));
        }
        btn.click();
        return btn.tagName + (btn.id ? "#" + btn.id : "");
    });
    console.log(`\tClicked builder button in active overlay (${result})`);

    // The active modal closes once the standard editor is chosen.
    try {
        await page.waitForFunction(
            () => !document.querySelector(".cdk-overlay-backdrop-showing"),
            { timeout: 20000 }
        );
        return;
    } catch (error) {
        dumpBuilderDialog(page);
        throw new Error('Could not advance past the "Start from Europass CV" dialog');
    }
};

const dumpBuilderDialog = async (page) => {
    try {
        const info = await page.evaluate(() => {
            const host = document.querySelector("#select-legacy-editor-btn");
            const hostRect = host ? host.getBoundingClientRect() : null;
            const size = (r) => (r ? { w: Math.round(r.width), h: Math.round(r.height), top: Math.round(r.top), left: Math.round(r.left) } : null);
            return {
                hostExists: !!host,
                hostTag: host ? host.tagName : null,
                hostRect: size(hostRect),
                hostHTML: host ? host.outerHTML.slice(0, 1200) : null,
                clickableInventory: Array.from(document.querySelectorAll("button, [role='button'], a"))
                    .filter((el) => (el.textContent || "").trim())
                    .slice(0, 25)
                    .map((el) => ({
                        text: (el.textContent || "").trim().slice(0, 40),
                        id: el.id || null,
                        rect: size(el.getBoundingClientRect()),
                    })),
            };
        });
        console.error("\tBuilder dialog still open. Diagnostics:", JSON.stringify(info, null, 2));
    } catch (dumpError) {
        console.error("\tCould not dump builder dialog:", dumpError);
    }
};

const clickWhenVisible = async (page, selector) => {
    // A real CDP mouse click (scrolls into view + trusted mouse events) is what
    // these Elements UI buttons need; fall back to a synthetic click if it can't.
    const handle = await page.waitForSelector(selector, { visible: true, timeout: defaultTimeout });
    try {
        await handle.click();
    } catch (error) {
        await handle.evaluate((el) => el.click());
    }
};

const activeStep = async (page) => page.evaluate(() => {
    const a = document.querySelector('div[role="tab"].eui-wizard-step--active');
    return a ? a.getAttribute("aria-label") : "none";
});

const logStep = async (page, label) => {
    const step = await activeStep(page);
    console.log(`\t[${label}] active step = "${step}"`);
    return step;
};

const gotoStep = async (page, tabLabel) => {
    // The wizard's "Next" button lives in a fixed-bottom footer that the step
    // card overlaps, so clicking it is unreliable; the step tabs always work.
    await clickWhenVisible(page, `div[role="tab"][aria-label="${tabLabel}"]`);
    await page.waitForSelector(`div[role="tab"][aria-label="${tabLabel}"].eui-wizard-step--active`, { timeout: 30000 });
};

const waitForCvId = async (net, timeoutMs) => {
    // The editor autosaves the imported CV a few seconds after the Edit step
    // opens, and only then does it know the CV's id. Leaving the Edit step
    // before that happens makes the Save step POST to /eprofile/cv/undefined,
    // which 500s and leaves the step permanently broken: no preview is ever
    // rendered and the Download button stays disabled.
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
        if (net.cvId()) return net.cvId();
        await new Promise((resolve) => setTimeout(resolve, 500));
    }
    return null;
};

const captureClientPdf = async (page, outPath) => {
    const result = await page.evaluate(async () => {
        const blobs = (window.__pdfBlobs || []).filter((x) => x.size > 1000);
        if (!blobs.length) return null;
        blobs.sort((a, b) => b.size - a.size);
        const target = blobs[0].blob;
        const dataUrl = await new Promise((resolve, reject) => {
            const fr = new FileReader();
            fr.onload = () => resolve(fr.result);
            fr.onerror = () => reject(fr.error);
            fr.readAsDataURL(target);
        });
        return { size: target.size, dataUrl };
    });
    if (!result) return false;
    const base64 = result.dataUrl.slice(result.dataUrl.indexOf(",") + 1);
    const bytes = Buffer.from(base64, "base64");
    if (bytes.subarray(0, 5).toString("latin1") !== "%PDF-") {
        console.log("\tCaptured Blob is not a PDF; ignoring it");
        return false;
    }
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, bytes);
    console.log(`\tCaptured client-side PDF (${bytes.length} bytes)`);
    return true;
};

const rasterizePreview = async (page, outPath) => {
    // The app renders the CV to PDF in-browser (PDF.js) and the Download button
    // can be left disabled by the wizard's save-state. We can still capture the
    // already-rendered page canvases and reassemble them into a PDF.
    let found = false;
    try {
        await page.waitForFunction(
            () => Array.from(document.querySelectorAll("cv-preview-pdf canvas")).some((c) => c.width > 100 && c.height > 100),
            { timeout: 45000 }
        );
        found = true;
    } catch (e) {
        found = false;
    }
    console.log(`\tPreview canvases present: ${found}`);
    if (!found) return false;
    const pages = await page.evaluate(() => {
        const canvases = Array.from(document.querySelectorAll("cv-preview-pdf canvas"));
        return canvases
            .filter((c) => c.width > 100 && c.height > 100)
            .map((c) => ({ dataUrl: c.toDataURL("image/png"), w: c.width, h: c.height }));
    });
    if (!pages.length) return false;
    console.log(`\tFound ${pages.length} rendered preview page(s)`);
    const pdfPage = await page.browser().newPage();
    const body = pages
        .map((p) => `<div style="width:210mm;height:297mm;page-break-after:always;overflow:hidden;">` +
            `<img src="${p.dataUrl}" style="width:210mm;height:297mm;object-fit:contain;display:block;"></div>`)
        .join("");
    await pdfPage.setContent(`<html><body style="margin:0">${body}</body></html>`, { waitUntil: "networkidle0" });
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    await pdfPage.pdf({ path: outPath, width: "210mm", height: "297mm", printBackground: true });
    await pdfPage.close();
    console.log(`\tReassembled preview into ${outPath}`);
    return true;
};

const download = async (page, net) => {
    try {
        console.log('\tWaiting for "Edit" tab ...');
        await page.waitForSelector('div[role="tab"][aria-label="Edit "].eui-wizard-step--active'); // Edit tab
        await page.waitForSelector("cv-language-selector-wrapper"); // Edit tab contents
        await logStep(page, "start");

        // Stay on the Edit step until the editor has autosaved the CV; leaving
        // early is what breaks the Save step (see waitForCvId).
        console.log("\tWaiting for the CV to be saved server-side ...");
        const cvId = await waitForCvId(net, 90000);
        if (!cvId) {
            throw new Error("The editor never created the CV server-side (no POST /eprofile/cv -> 201)");
        }
        console.log(`\tCV saved as ${cvId}`);

        // Check for discrepancies
        console.log("\tChecking for discrepancies...");
        const discrepanciesSelector = 'h5#headerTitle.eui-dialog__header-title.ng-star-inserted';
        const discrepanciesFound = await page.$(discrepanciesSelector);

        if (discrepanciesFound) {
            console.log("\tDiscrepancies found. Please resolve them manually.");
            console.log('\tClicking on "OK" button...');
            await page.evaluate(() => {
                const okButton = document.querySelector('button#ok');
                if (okButton) {
                    okButton.click();
                }
            });

            await new Promise((resolve) => setTimeout(resolve, delay));
        }

        console.log('\tAdvancing to "Select template" step ...');
        await gotoStep(page, 'Select template ');
        await logStep(page, "after template nav");
        await page.waitForSelector("eportfolio-html-preview"); // Template tab contents

        console.log('\tAdvancing to "Save" step ...');
        await gotoStep(page, 'Save ');
        await logStep(page, "after save nav");

        // The Save step renders the CV to PDF client-side (PDF.js). Wait for
        // either the generated Blob or the rendered page canvases.
        console.log('\tWaiting for "CV preview" ...');
        await page.waitForSelector("cv-preview-pdf");
        try {
            await page.waitForFunction(
                () => (window.__pdfBlobs || []).some((b) => b.size > 1000) ||
                    Array.from(document.querySelectorAll("cv-preview-pdf canvas")).some((c) => c.width > 100 && c.height > 100),
                { timeout: 120000 }
            );
            console.log("\tCV preview rendered");
        } catch (previewError) {
            console.log("\tCV preview did not render within 120s; attempting download anyway");
        }

        // The preview PDF is the CV rendered client-side. Capture it directly —
        // this bypasses the Download button, which the app can leave disabled.
        const outDir = path.join(__dirname, "downloads");
        const outPath = path.join(outDir, "europass.pdf");
        const captured = await captureClientPdf(page, outPath).catch((e) => {
            console.log(`\tClient PDF capture failed: ${e.message}`);
            return false;
        });
        if (captured) {
            return;
        }
        // No Blob hook hit; capture the already-rendered preview canvases.
        const rasterized = await rasterizePreview(page, outPath).catch((e) => {
            console.log(`\tPreview rasterization failed: ${e.message}`);
            return false;
        });
        if (rasterized) {
            return;
        }
        console.log('\tNo client-side PDF captured; falling back to the Download button ...');
        console.log("\tInputting CV name ...");
        await new Promise((resolve) => setTimeout(resolve, delay));
        await page.evaluate(() => {
            document.querySelector("input[euiinputtext]").value = "europass";
            const event = new Event("input", { bubbles: true });
            document.querySelector("input[euiinputtext]").dispatchEvent(event);
        });

        await page.waitForSelector("cv-download-button");
        await logStep(page, "before download");
        // The button is disabled while the app (re)generates the CV; clicking it
        // then is a no-op that only surfaces as a download timeout.
        try {
            await page.waitForFunction(
                () => {
                    const b = document.querySelector("cv-download-button button");
                    return b !== null && !b.disabled;
                },
                { timeout: 60000 }
            );
        } catch (enableError) {
            console.log("\tDownload button still disabled after 60s; clicking anyway");
        }
        const dlState = await page.evaluate(() => {
            const b = document.querySelector("cv-download-button button");
            return b
                ? { disabled: b.disabled, ariaDisabled: b.getAttribute("aria-disabled"), visible: b.offsetParent !== null, text: (b.textContent || "").trim() }
                : "no-button";
        });
        console.log('\tDownload button state:', JSON.stringify(dlState));
        console.log('\tClicking on "Download" button ...');
        fs.mkdirSync(path.join(__dirname, "downloads"), { recursive: true });
        const client = await page.createCDPSession();
        await client.send("Page.setDownloadBehavior", {
            behavior: "allow",
            downloadPath: path.join(__dirname, "downloads"),
        });

        const downloadPath = path.join(__dirname, "downloads/europass.pdf");
        const dlDir = path.join(__dirname, "downloads");
        // Remove any leftover PDFs so we can detect a fresh download by any name.
        for (const f of fs.readdirSync(dlDir).filter((f) => f.endsWith(".pdf"))) {
            fs.unlinkSync(path.join(dlDir, f));
        }
        await clickWhenVisible(page, "cv-download-button button");

        // Wait for the PDF to land (the app may choose its own filename), then
        // normalize it to europass.pdf. Server-side generation can be slow.
        console.log("\tWaiting for download to complete ...");
        const timeout = 120000;
        const startTime = Date.now();
        let landed = null;
        while (!landed) {
            if (Date.now() - startTime > timeout) {
                throw new Error("Download timed out");
            }
            landed = fs.readdirSync(dlDir).find((f) => f.endsWith(".pdf"));
            await new Promise((resolve) => setTimeout(resolve, 1000));
        }
        if (landed !== "europass.pdf") {
            fs.renameSync(path.join(dlDir, landed), downloadPath);
            console.log(`\tRenamed downloaded ${landed} to europass.pdf`);
        }
    } catch (error) {
        console.error("Error downloading the CV:", error);
        throw error;
    }
};

const attachNetworkLogger = (page) => {
    const lines = [];
    let cvId = null;
    const log = (r) => ["xhr", "fetch", "document", "other", "media"].includes(r.resourceType());
    page.on("request", (req) => {
        if (log(req)) lines.push(`> ${req.method()} [${req.resourceType()}] ${req.url()}`);
    });
    page.on("response", async (res) => {
        const req = res.request();
        if (log(req)) lines.push(`< ${res.status()} [${req.resourceType()}] ${req.url()}`);
        if (req.method() === "POST" && new URL(res.url()).pathname.endsWith("/eprofile/cv") && res.status() === 201) {
            try {
                const body = await res.text();
                lines.push(`@@ CV CREATED (201) body: ${body.slice(0, 400)}`);
                cvId = JSON.parse(body).id ?? cvId;
            } catch (e) {
                lines.push("@@ CV CREATED (201) body: <unreadable>");
            }
        }
    });
    page.on("requestfailed", (req) => {
        if (log(req)) lines.push(`! FAILED ${req.method()} [${req.resourceType()}] ${req.url()} :: ${req.failure()?.errorText ?? "unknown"}`);
    });
    page.on("download", (d) => {
        lines.push(`@@ DOWNLOAD started: ${d.url()} -> ${d.suggestedFilename()}`);
    });
    page.on("popup", (p) => {
        lines.push(`@@ POPUP opened: ${p.url()}`);
    });
    return { dump: () => lines.join("\n"), cvId: () => cvId };
};

const saveFailureArtifacts = async (page, net) => {
    const dir = path.join(__dirname, "downloads");
    fs.mkdirSync(dir, { recursive: true });
    try {
        await page.screenshot({ path: path.join(dir, "europass-failed.png"), fullPage: true });
        console.log("Failure screenshot saved to downloads/europass-failed.png");
    } catch (e) {
        console.error("Could not save failure screenshot:", e);
    }
    try {
        const html = await page.evaluate(() => document.documentElement.outerHTML);
        fs.writeFileSync(path.join(dir, "europass-failed.html"), html);
        console.log(`Failure HTML saved to downloads/europass-failed.html (${html.length} chars)`);
    } catch (e) {
        console.error("Could not save failure HTML:", e);
    }
    try {
        fs.writeFileSync(path.join(dir, "europass-network.log"), net.dump());
        console.log("Network log saved to downloads/europass-network.log");
    } catch (e) {
        console.error("Could not save network log:", e);
    }
};

const runOnce = async () => {
    const browser = await puppeteer.launch({
        headless: !DEBUG,
        devtools: DEBUG,
        defaultViewport: DEBUG ? null : undefined,
        args: DEBUG
            ? ['--start-maximized']
            : ['--no-sandbox', '--disable-setuid-sandbox'],
        slowMo: DEBUG ? 250 : 0
    });
    const page = await browser.newPage();
    page.setDefaultTimeout(defaultTimeout);
    const net = attachNetworkLogger(page);

    try {
        const xmlPath = path.join(__dirname, "..", "_site", "cv/europass.xml");
        if (!fs.existsSync(xmlPath) || fs.statSync(xmlPath).size === 0) {
            throw new Error(`Europass XML missing or empty at ${xmlPath}; run the site build first`);
        }
        console.log("Creating Europass CV...");
        await prepare(page);
        console.log("Uploading Europass XML...");
        await upload(xmlPath, page);
        console.log("Downloading Europass PDF...");
        await download(page, net);

        console.log("Europass CV created successfully!");
    } catch (error) {
        // Capture what the page looks like when the flow breaks
        await saveFailureArtifacts(page, net);
        throw error;
    } finally {
        await browser.close();
    }
};

const create = async () => {
    let lastError;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        if (attempt > 1) {
            console.log(`Retrying Europass CV creation (attempt ${attempt}/${maxAttempts}) in ${retryWaitMs / 1000}s...`);
            await new Promise((resolve) => setTimeout(resolve, retryWaitMs));
        }
        try {
            await runOnce();
            return;
        } catch (error) {
            lastError = error;
            console.error(`Attempt ${attempt}/${maxAttempts} failed:`, error);
        }
    }
    throw lastError;
};

create().catch((error) => {
    console.error("Europass CV creation failed:", error);
    process.exit(1);
});
