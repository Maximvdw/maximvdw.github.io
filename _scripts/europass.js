import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import puppeteer from "puppeteer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const delay = 8000;    // Should not need this

const prepare = async (page) => {
    try {
        // Perform a GET request to retrieve cookies
        await page.goto(
            "https://europa.eu/europass/eportfolio/screen/cv-editor?lang=en"
        );

        // Wait for the necessary JavaScript to execute and set the cookies
        await page.waitForSelector("select-existing-file-button"); // Adjust the selector as needed

        const cookies = await page.cookies();
        const xsrfCookie = cookies.find((cookie) => cookie.name === "XSRF-TOKEN");

        if (!xsrfCookie) {
            throw new Error("XSRF-TOKEN cookie not found");
        }
    } catch (error) {
        console.error("Error making POST request:", error);
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
        await input.uploadFile(file);
        // Click the save button
        console.log('\tClicking on "Save" button...');
        await page.evaluate(() => {
            document.querySelectorAll("eui-dialog-footer button")[1].click();
        });
    } catch (error) {
        console.error("Error making POST request:", error);
    }
};

const download = async (page) => {
    try {
        // Click two times on the next button when available
        console.log('\tWaiting for "Edit" tab ...');
        await page.waitForSelector('div[role="tab"][aria-label="Edit "].eui-wizard-step--active'); // Edit tab
        await page.waitForSelector("cv-language-selector-wrapper"); // Edit tab contents
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
        console.log('\tWaiting for "Download" button ...');
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
        const client = await page.target().createCDPSession();
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
        const timeout = 15000; // 15 seconds
        const startTime = Date.now();

        while (!fs.existsSync(downloadPath)) {
            if (Date.now() - startTime > timeout) {
                throw new Error("Download timed out");
            }
            await new Promise((resolve) => setTimeout(resolve, 1000));
        }
    } catch (error) {
        console.error("Error downloading the CV:", error);
        // console.log(await page.content());
    }
};

async function create() {
    const browser = await puppeteer.launch({
        headless: true,
        // args: ['--no-sandbox', '--disable-setuid-sandbox'],
        // slowMo: 50
    });
    const page = await browser.newPage();

    console.log("Creating Europass CV...");
    await prepare(page);
    console.log("Uploading Europass XML...");
    await upload(path.join(__dirname, "..", "_site", "cv/europass.xml"), page);
    console.log("Downloading Europass PDF...");
    await download(page);

    console.log("Europass CV created successfully!");
    await browser.close();
}

create();
