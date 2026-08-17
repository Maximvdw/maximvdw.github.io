#!/usr/bin/env node
/**
 * Image Optimization Script
 * Generates WebP variants of all images while keeping originals intact.
 */

import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.join(__dirname, '..');
const IMAGES_DIR = path.join(PROJECT_ROOT, 'images');

// Directories to process
const TARGET_DIRS = [
    { dir: path.join(IMAGES_DIR, 'profile'), label: 'Profile Images' },
    { dir: path.join(IMAGES_DIR, 'social'), label: 'Social Share Images' },
    { dir: path.join(IMAGES_DIR, 'logo'), label: 'Logo Images' },
];

// WebP quality settings (75 is good balance between quality and size)
const WEBP_QUALITY = 75;
const WEBP_EFFORT = 6; // Higher effort = better compression but slower

/**
 * Recursively find all image files in a directory tree.
 */
async function findImageFiles(dir) {
    const validExts = new Set(['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.tiff']);
    let results = [];
    
    try {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            
            if (entry.isDirectory()) {
                // Recurse into subdirectories
                const subResults = await findImageFiles(fullPath);
                results = results.concat(subResults);
            } else if (entry.isFile() && validExts.has(path.extname(entry.name).toLowerCase())) {
                results.push({
                    inputPath: fullPath,
                    baseName: path.basename(entry.name),
                    ext: path.extname(entry.name).toLowerCase(),
                    dir: path.dirname(fullPath)
                });
            }
        }
    } catch (error) {
        // Directory doesn't exist or isn't accessible — skip silently
    }
    
    return results;
}

/**
 * Optimize a single image file by creating a WebP variant.
 */
async function optimizeImage(inputPath) {
    const ext = path.extname(inputPath).toLowerCase();
    
    // Skip non-image files and already-webp files
    if (!['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.tiff'].includes(ext)) {
        return null;
    }
    
    const baseName = path.basename(inputPath, ext);
    const dir = path.dirname(inputPath);
    const webpPath = path.join(dir, `${baseName}.webp`);
    
    try {
        await sharp(inputPath)
            .webp({ quality: WEBP_QUALITY, effort: WEBP_EFFORT })
            .toFile(webpPath);
        
        const originalStat = await fs.stat(inputPath);
        const webpStat = await fs.stat(webpPath);
        const savings = ((originalStat.size - webpStat.size) / originalStat.size * 100).toFixed(1);
        
        console.log(`✓ ${path.relative(PROJECT_ROOT, inputPath)} → WebP (${savings}% smaller)`);
        return { webpPath, savings };
    } catch (error) {
        console.error(`✗ Failed to optimize ${inputPath}:`, error.message);
        return null;
    }
}

/**
 * Process all images in a directory tree recursively.
 */
async function processDirectoryTree(dirInfo) {
    let optimized = 0;
    let skipped = 0;
    
    try {
        // First check if the top-level exists
        await fs.access(dirInfo.dir);
    } catch {
        // Directory doesn't exist — skip silently
        console.log(`${dirInfo.label}: directory not found\n`);
        return;
    }
    
    // Find all image files recursively
    const files = await findImageFiles(dirInfo.dir);
    
    for (const file of files) {
        const result = await optimizeImage(file.inputPath);
        if (result) {
            optimized++;
        } else {
            skipped++;
        }
    }
    
    console.log(`${dirInfo.label}: ${files.length} images scanned, ${optimized} optimized${skipped > 0 ? `, ${skipped} skipped` : ''}\n`);
}

/**
 * Main entry point.
 */
async function main() {
    console.log('🖼️  Starting image optimization...\n');
    
    // Process each target directory tree
    for (const dirInfo of TARGET_DIRS) {
        await processDirectoryTree(dirInfo);
    }
    
    console.log('✅ Image optimization complete!');
    console.log('\nNext steps:');
    console.log('1. Update template src references to use .webp variants');
    console.log('2. Add width/height attributes to all <img> tags');
    console.log('3. Consider adding loading="lazy" to below-fold images');
}

main().catch(console.error);
