import fs from "fs";
import path from "path";
import http from "http";
import { fileURLToPath } from "url";
import puppeteer from "puppeteer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const siteDir = path.join(__dirname, "..", "_site");
const downloadsDir = path.join(__dirname, "downloads");
const port = 8917;
const defaultTimeout = 120000; // ms, per page action timeout

const cvs = ["regular", "academic"];

const MIME_TYPES = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".xml": "application/xml; charset=utf-8",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
    ".ttf": "font/ttf",
    ".webp": "image/webp",
    ".pdf": "application/pdf",
};

const serveSite = () =>
    new Promise((resolve, reject) => {
        const server = http.createServer((req, res) => {
            const urlPath = decodeURIComponent(
                new URL(req.url, `http://127.0.0.1:${port}`).pathname
            );
            let filePath = path.normalize(path.join(siteDir, urlPath));
            if (!filePath.startsWith(siteDir)) {
                res.writeHead(403);
                res.end("Forbidden");
                return;
            }
            if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
                filePath = path.join(filePath, "index.html");
            }
            if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
                res.writeHead(404);
                res.end("Not found");
                return;
            }
            res.writeHead(200, {
                "Content-Type":
                    MIME_TYPES[path.extname(filePath).toLowerCase()] ??
                    "application/octet-stream",
            });
            fs.createReadStream(filePath).pipe(res);
        });
        server.on("error", reject);
        server.listen(port, "127.0.0.1", () => resolve(server));
    });

const waitForAssets = async (page) => {
    await page.evaluate(async () => {
        await document.fonts.ready;
        await Promise.all(
            Array.from(document.images).map((img) =>
                img.complete
                    ? Promise.resolve()
                    : new Promise((resolve) => {
                          img.onload = resolve;
                          img.onerror = resolve;
                      })
            )
        );
    });
};

const renderCv = async (page, name) => {
    const pageUrl = `http://127.0.0.1:${port}/cv/${name}/`;
    const pdfPath = path.join(siteDir, "cv", `${name}.pdf`);
    console.log(`Rendering ${pageUrl} to PDF...`);
    await page.goto(pageUrl, { waitUntil: "networkidle0", timeout: defaultTimeout });
    await waitForAssets(page);
    if (fs.existsSync(pdfPath)) {
        fs.unlinkSync(pdfPath);
    }
    await page.pdf({
        path: pdfPath,
        format: "A4",
        printBackground: true,
        preferCSSPageSize: true,
    });
    if (!fs.existsSync(pdfPath) || fs.statSync(pdfPath).size === 0) {
        throw new Error(`PDF missing or empty at ${pdfPath}`);
    }
    console.log(
        `\t${name}.pdf generated (${fs.statSync(pdfPath).size} bytes)`
    );
};

const saveFailureScreenshot = async (browser, name) => {
    try {
        fs.mkdirSync(downloadsDir, { recursive: true });
        const pages = browser.pages();
        if (pages.length === 0) {
            return;
        }
        const screenshotPath = path.join(
            downloadsDir,
            `cv-${name}-failed.png`
        );
        await pages[pages.length - 1].screenshot({
            path: screenshotPath,
            fullPage: true,
        });
        console.log(`Failure screenshot saved to ${screenshotPath}`);
    } catch (screenshotError) {
        console.error("Could not save failure screenshot:", screenshotError);
    }
};

const main = async () => {
    for (const name of cvs) {
        const htmlPath = path.join(siteDir, "cv", name, "index.html");
        if (!fs.existsSync(htmlPath)) {
            throw new Error(
                `${name} CV HTML missing at ${htmlPath}; run the site build first`
            );
        }
    }

    const server = await serveSite();
    const browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    let currentCv = cvs[0];
    try {
        const page = await browser.newPage();
        page.setDefaultTimeout(defaultTimeout);
        for (const name of cvs) {
            currentCv = name;
            await renderCv(page, name);
        }
        console.log("CV PDFs generated successfully!");
    } catch (error) {
        await saveFailureScreenshot(browser, currentCv);
        throw error;
    } finally {
        await browser.close();
        server.close();
    }
};

main().catch((error) => {
    console.error("CV PDF generation failed:", error);
    process.exit(1);
});
