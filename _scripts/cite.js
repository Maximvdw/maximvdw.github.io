/**
 * Script for generating citation information for each publication
 */
import { Cite } from '@citation-js/core';
import '@citation-js/plugin-doi';
import '@citation-js/plugin-bibtex';
import '@citation-js/plugin-csl';

export default function (config, options = defaultOptions) {
    // Loop through each publication (collection) and generate citation information
    config.addPreprocessor("citations", "md", async (data, outputPath) => {
        if (data.tags && data.tags.includes("publications")) {
            await generateCitation(data);
        }
    });
}

async function generateCitation(item) {
    const doi = item.doi;
    if (doi) {
        const data = await Cite.async(doi);
        console.log("Generating citation for", doi);
        const bibtex = data.format('bibtex');
        item.bibtex = bibtex;

        // Format output
        const apa = data.format('bibliography', {
            format: 'text',
            template: 'apa',
            lang: 'en-US'
        })
        // Set the excerpt to the formatted bibliography
        item.excerpt = apa;
    }
}

    