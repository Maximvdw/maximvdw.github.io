/**
 * Script for generating citation information for each publication
 */
import { Cite } from '@citation-js/core';
import '@citation-js/plugin-doi';
import '@citation-js/plugin-bibtex';
import '@citation-js/plugin-csl';
import * as fs from 'fs';
import * as path from 'path';

export default function (config, options = defaultOptions) {
    // Loop through each publication (collection) and generate citation information
    config.addPreprocessor("citations", "md", async (data, outputPath) => {
        if (data.tags && data.tags.includes("publications")) {
            await generateCitation(data);
        }
    });
}

async function generateCitation(item) {
    const bib = item.bib;
    if (bib) {
        // Get bibtex data from bib path
        const __dirname = path.dirname(new URL(import.meta.url).pathname);
        const data = fs.readFileSync(path.join(__dirname, "..", bib), 'utf8');
        const citation = await Cite.async(data, { forceType: '@bibtex/text' });
        console.log("Generating citation for", bib);
        const bibtex = citation.format('bibtex');
        item.bibtex = bibtex;

        // Format output
        const apa = citation.format('bibliography', {
            format: 'text',
            template: 'apa',
            lang: 'en-US'
        })
        // Set the excerpt to the formatted bibliography
        item.excerpt = apa;
        if (apa.length > 250) {
            console.log("\tExcerpt too long for Europass, generating short excerpt");
            // Create a short excerpt
            let shortExcerpt = apa.substring(0, 250);
            const lastSpaceIndex = shortExcerpt.lastIndexOf(' ');
            if (lastSpaceIndex > -1) {
                shortExcerpt = shortExcerpt.substring(0, lastSpaceIndex);
            }
            item.excerpt_short = shortExcerpt;
        }

        // Get the authors from the citation
        const authors = citation.get().map(entry => entry.author).flat();
        item.authors = authors;
    }
}

    