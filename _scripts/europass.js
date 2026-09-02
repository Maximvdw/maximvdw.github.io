import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import puppeteer from "puppeteer";

const DEBUG = false;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const delay = 8000;    // Should not need this
const maxAttempts = 3;          // full-flow retries for the flaky live site
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
        await page.evaluate(() => {
            document.querySelector("#select-legacy-editor-btn button").click();
        });
    } catch (error) {
        console.error("Error uploading the CV XML:", error);
        throw error;
    }
};

const download = async (page) => {
    try {
        // Click two times on the next button when available
        console.log('\tWaiting for "Edit" tab ...');
        await page.waitForSelector('div[role="tab"][aria-label="Edit "].eui-wizard-step--active'); // Edit tab
        await page.waitForSelector("cv-language-selector-wrapper"); // Edit tab contents

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

        console.log('\tClicking on "Next" button ...');
        await new Promise((resolve) => setTimeout(resolve, delay));
        await page.evaluate(() => {
            document.querySelector("button#wizard-nav-next").click();
        });

        console.log('\tWaiting for "Select template" tab ...');
        await page.waitForSelector('div[role="tab"][aria-label="Select template "].eui-wizard-step--active'); // Template
        await page.waitForSelector("eportfolio-html-preview"); // Template tab contents
        console.log('\tClicking on "Next" button ...');
        await new Promise((resolve) => setTimeout(resolve, delay + 5000));
        await page.evaluate(() => {
            document.querySelector("button#wizard-nav-next").click();
        });

        // Wait for the download button to be available
        console.log('\tWaiting for "CV preview" ...');
        await new Promise((resolve) => setTimeout(resolve, delay));
        await page.evaluate(() => {
            console.log(document.documentElement.innerHTML);
        });
        await page.waitForSelector("cv-preview-pdf");
        console.log("\tInputting CV name ...");
        await new Promise((resolve) => setTimeout(resolve, delay));
        await page.evaluate(() => {
            document.querySelector("input[euiinputtext]").value = "europass";
            const event = new Event("input", { bubbles: true });
            document.querySelector("input[euiinputtext]").dispatchEvent(event);
        });

        await page.waitForSelector("cv-download-button");
        console.log('\tClicking on "Download" button ...');
        fs.mkdirSync(path.join(__dirname, "downloads"), { recursive: true });
        const client = await page.createCDPSession();
        await client.send("Page.setDownloadBehavior", {
            behavior: "allow",
            downloadPath: path.join(__dirname, "downloads"),
        });

        // Click the download button
        const downloadPath = path.join(__dirname, "downloads/europass.pdf");
        // Delete the file if it already exists
        if (fs.existsSync(downloadPath)) {
            fs.unlinkSync(downloadPath);
        }
        await new Promise((resolve) => setTimeout(resolve, delay));
        await page.evaluate(() => {
            document.querySelector("cv-download-button button").click();
        });

        // Wait for the download to complete
        console.log("\tWaiting for download to complete ...");
        // Check __dirname + 'downloads' for the file
        const timeout = 60000; // 60 seconds (server-side PDF generation can be slow)
        const startTime = Date.now();

        while (!fs.existsSync(downloadPath)) {
            if (Date.now() - startTime > timeout) {
                throw new Error("Download timed out");
            }
            await new Promise((resolve) => setTimeout(resolve, 1000));
        }
    } catch (error) {
        console.error("Error downloading the CV:", error);
        throw error;
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
        await download(page);

        console.log("Europass CV created successfully!");
    } catch (error) {
        // Capture what the page looks like when the flow breaks
        try {
            fs.mkdirSync(path.join(__dirname, "downloads"), { recursive: true });
            await page.screenshot({
                path: path.join(__dirname, "downloads", "europass-failed.png"),
                fullPage: true,
            });
            console.log("Failure screenshot saved to downloads/europass-failed.png");
        } catch (screenshotError) {
            console.error("Could not save failure screenshot:", screenshotError);
        }
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
