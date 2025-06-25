import markdownIt from "markdown-it";
import markdownItAnchor from "markdown-it-anchor";
import markdownItVideo from "markdown-it-video";
import { html5Media } from 'markdown-it-html5-media';
import pluginTOC from 'eleventy-plugin-toc';
import pluginSEO from "eleventy-plugin-seo";
import pluginSASS from "eleventy-sass";
import pluginSitemap from "@quasibit/eleventy-plugin-sitemap";
import pluginRss from "@11ty/eleventy-plugin-rss";
import pluginNavigation from "@11ty/eleventy-navigation";
import pluginCite from './_scripts/cite.js';
import pluginReadingTime from 'eleventy-plugin-reading-time';

import { DateTime } from "luxon";
import fs from 'fs';
import nunjucks from "nunjucks";
import markdown from 'nunjucks-markdown';
import markdownItAttrs from 'markdown-it-attrs';
import pluginPDFEmbed from 'eleventy-plugin-pdfembed';
import pluginFavicon from "eleventy-plugin-gen-favicons";
import _ from "lodash";
import pluginHTMLValidate from "./scripts/validator.js";
import axios from 'axios';

export default async function (el) {
    /* Passthrough Copy */
    el.addPassthroughCopy("fonts");
    el.addPassthroughCopy("CNAME");
    el.addPassthroughCopy("scripts");
    el.setDataDeepMerge(true);
    el.addPassthroughCopy({
        "node_modules/@pdftron/pdfjs-express-viewer/public/": "scripts/lib/webviewer/",
        "node_modules/@pdftron/pdfjs-express-viewer/webviewer.min.js": "scripts/lib/webviewer/webviewer.min.js",
    });

    /* SEO */
    const seoConfig = JSON.parse(fs.readFileSync('./_data/seo.json', 'utf8'));
    el.addPlugin(pluginSEO, seoConfig);
    el.addPlugin(pluginSitemap, {
        sitemap: {
            hostname: "https://maximvdw.be",
        },
    });
    el.addPlugin(pluginFavicon);
    el.addPlugin(pluginRss);
    //el.addPlugin(pluginValidator);
    el.addPlugin(pluginNavigation);
    const socialConfig = JSON.parse(fs.readFileSync('./_data/social.json', 'utf8'));
    /* Social Config */
    el.addGlobalData("social", socialConfig);

    el.addPlugin(pluginCite);

    /* PDF Embedding */
    el.addPlugin(pluginPDFEmbed, {
        key: 'd53c00f0cb1a4ff7970bfcacf82145aa'
    });

    el.addPlugin(pluginHTMLValidate, {
        validator: 'http://localhost:8888',
    });

    /* Markdown */
    el.addPlugin(pluginReadingTime);
    const md = markdownIt({ html: true });
    md.use(markdownItAnchor);
    md.use(markdownItAttrs, {
        leftDelimiter: '{$',
        rightDelimiter: '$}',
        allowedAttributes: []
    });
    const highlighter = el.markdownHighlighter;
    el.markdownHighlighter = (code, lang, fence) => {
        const result = highlighter(code, lang, fence);
        return result === "" ? "<pre style='display: none'></pre>" : result;
    };
    md.use(markdownItVideo, {
        youtube: { width: 640, height: 390 },
        vimeo: { width: 500, height: 281 },
        vine: { width: 600, height: 600, embed: 'simple' },
        prezi: { width: 550, height: 400 }
    });
    md.use(html5Media);
    el.setLibrary("md", md);
    el.addPlugin(pluginTOC, {
        tags: ['h2'],
        ul: true
    });

    /* Stylesheets */
    el.addPlugin(pluginSASS, [
        {
            compileOptions: {
                permalink: function() {
                    return (data) => {
                        return data.page.filePathStem.replace(/^\/_scss\//, "/css/") + ".css";
                    };
                }
            },
            sass: {
                style: "expanded",
                sourceMap: true
            }
        }, {
            rev: true,
            when: { ELEVENTY_ENV: "stage" }
        }, {
            sass: {
                style: "compressed",
                sourceMap: false
            },
            rev: true,
            when: [ { ELEVENTY_ENV: "production" }, { ELEVENTY_ENV: false } ]
        }
    ]);

    /* Nunjucks */
    const njkEnv = new nunjucks.Environment(
        new nunjucks.FileSystemLoader("_includes")
    );
    markdown.register(njkEnv, (src, _) => {
        return md.render(src);
    });
    el.setLibrary("njk", njkEnv);

    configureCollections(el);
    configureFilters(el);

    el.addWatchTarget("_scss");
    el.setChokidarConfig({
		usePolling: true,
		interval: 500,
	});
    
    el.setBrowserSyncConfig({
        callbacks: {
            ready: function(_, browserSync) {
                const content_404 = fs.readFileSync('_site/404.html');
                browserSync.addMiddleware("*", (req, res) => {
                    // Provides the 404 content without redirect.
                    res.write(content_404);
                    res.end();
                });
            },
        },
        ui: false,
        ghostMode: false
    });

    el.addGlobalData("build", {
        timestamp: DateTime.now().toISO()
    });

    return {
        templateFormats: [
            "ico",
            "njk",
            "jpg",
            "jpeg",
            "md",
            "html",
            "liquid",
            "svg",
            "png",
            "bmp",
            "pdf",
            'gif',
            "mp4",
            "webm",
            "webp", 
            "zip" 
        ],
        markdownTemplateEngine: "liquid",
        htmlTemplateEngine: "njk",
        dataTemplateEngine: "njk",
        dir: {
            input: ".",
            includes: "_includes",
            layouts: "_layouts",
            data: "_data",
            output: "_site"
        }
    };
};

async function configureCollections(el) {
    el.addCollection("posts_year", (collection) => {
        return _.chain(collection.getFilteredByTag("posts").sort((a, b) => a.date - b.date))
            .groupBy((post) => post.date.getFullYear())
            .toPairs()
            .reverse()
            .value();
    });
    el.addCollection("publications_year", (collection) => {
        return _.chain(collection.getFilteredByTag("publications").sort((a, b) => a.date - b.date))
            .groupBy((post) => post.date.getFullYear())
            .toPairs()
            .reverse()
            .value();
    });
    el.addCollection("presentations_year", (collection) => {
        return _.chain(collection.getFilteredByTag("presentations").sort((a, b) => a.date - b.date))
            .groupBy((post) => post.date.getFullYear())
            .toPairs()
            .reverse()
            .value();
    });
    el.addCollection("portfolio", (collection) => {
        return collection.getFilteredByTag("portfolio").sort((a, b) => {
            if (a.data.ongoing && !b.data.ongoing) {
            return -1;
            } else if (!a.data.ongoing && b.data.ongoing) {
            return 1;
            } else if (a.data.ongoing && b.data.ongoing) {
            return 0;
            } else {
            return new Date(b.data.end) - new Date(a.data.end);
            }
        });
    });
}

async function configureFilters(el) {
    el.addFilter("readableDate", dateObj => {
        return DateTime.fromJSDate(dateObj, {zone: 'utc'}).toFormat("cccc, dd LLL yyyy");
    });

    el.addFilter('htmlDateString', (dateObj) => {
        return DateTime.fromJSDate(dateObj, {zone: 'utc'}).toFormat('yyyy-LL-dd');
    });

    

    el.addFilter("head", (array, n) => {
        if (n < 0) {
            return array.slice(n);
        }
        return array.slice(0, n);
    });

    el.addFilter("min", (...numbers) => {
        return Math.min.apply(null, numbers);
    });

    el.addFilter('urlmatch', function(array, value) {
        return array.filter(item => item['url'].startsWith(value));
    });

    el.addFilter("padStart", (value, length, char) => {
        return String(value).padStart(length, char);
    });

    el.addFilter("base64", async (data) => {
        if (data.startsWith('http://') || data.startsWith('https://')) {
            try {
                const response = await axios.get(data, { responseType: 'arraybuffer' });
                const base64 = Buffer.from(response.data, 'binary').toString('base64');
                return `data:${response.headers['content-type']};base64,${base64}`;
            } catch (error) {
                console.error("Error fetching image for base64 filter:", error);
                return null;
            }
        } else {
            // base64 the data
            return Buffer.from(data).toString('base64');
        }
    });

    el.addFilter("date", (dateObj, format, lang) => {
        const backup = dateObj;
        if (typeof dateObj === 'string') {
            dateObj = DateTime.fromFormat(dateObj, 'yyyy-LL-dd').toJSDate();
            if (!dateObj || isNaN(dateObj.getTime())) {
                return backup;
            }
        }
        let dt = DateTime.fromJSDate(dateObj, {zone: 'utc'});
        if (lang) {
            console.log("Setting locale to", lang);
            dt = dt.setLocale(lang);
        }
        const result = dt.toFormat(format);
        if (!result || result === 'Invalid DateTime') {
            return null;
        } else {
            return result;
        }
    });

    el.addFilter("push", (array, item) => {
        array.push(item);
        return array;
    });

    el.addFilter("merge", (obj1, obj2) => {
        return { ...obj1, ...obj2 };
    });

    el.addFilter("slice", (array, start, end) => {
        return array.slice(start, end);
    });

    
    // Add a custom Nunjucks filter for 'map'
    el.addNunjucksFilter("map", function(array, property, collection) {
        if (!Array.isArray(array)) return [];
        if (collection && Array.isArray(collection)) {
            // If a collection is provided, find items in the collection by property
            return array.map(val => collection.find(item => item.data && item.data[property] === val));
        } else {
            // Otherwise, map property from array of objects
            return array.map(item => item && item[property]);
        }
    });

    // Add a custom Nunjucks filter for 'filter'
    el.addNunjucksFilter("filter", function(array, options) {
        if (!Array.isArray(array)) return [];
        const attribute = options && options.attribute;
        const value = options && options.value;
        const startswith = options && options.startswith;
        if (!attribute || value === undefined) return array;
        return array.filter(item => {
            const attrValue = item && (item[attribute] ?? (item.data && item.data[attribute]));
            if (startswith) {
                return typeof attrValue === "string" && attrValue.startsWith(value);
            } else {
                return attrValue === value;
            }
        });
    });
}
