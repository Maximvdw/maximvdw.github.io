import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const postData = async () => {
    try {
        const form = new FormData();
        form.append('file', fs.createReadStream(path.join(__dirname, '..', '_site', 'cv/europass.xml')));
        // Perform a GET request to retrieve cookies
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto('https://europa.eu/europass/eportfolio/screen/cv-editor?lang=en');

        // Wait for the necessary JavaScript to execute and set the cookies
        await page.waitForSelector('select-existing-file-button'); // Adjust the selector as needed

        const cookies = await page.cookies();
        const xsrfCookie = cookies.find(cookie => cookie.name === 'XSRF-TOKEN');

        await browser.close();

        if (!xsrfCookie) {
            throw new Error('XSRF-TOKEN cookie not found');
        }

        // Perform the POST request with the retrieved cookies
        const response = await axios.post('https://europa.eu/europass/eportfolio/api/eprofile/europass-cv', form, {
            headers: {
            'Accept': 'application/json',
            'Content-Type': 'multipart/form-data',
            'Cookie': cookies.map(c => `${c.name}=${c.value}`).join('; '),
            'x-xsrf-token': xsrfCookie.value,
            ...form.getHeaders()
            }
        });
        console.log(response.data);
    } catch (error) {
        console.error('Error making POST request:', error);
    }
};

postData();
