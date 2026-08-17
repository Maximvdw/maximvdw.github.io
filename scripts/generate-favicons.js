#!/usr/bin/env node
/**
 * Favicon Generation Script
 * Generates multi-size favicons/icons from a source image using sharp.
 */

import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.join(__dirname, '..');
const SOURCE_IMAGE = path.join(PROJECT_ROOT, 'images', 'favicon.png');

// Favicon sizes needed for different platforms
const SIZES = [
    16,   // Small browser tab
    32,   // Standard browser tab
    48,   // Windows tile
    72,   // iOS touch icon (older devices)
    96,   // Android Chrome
    128,  // High-res display
    144,  // iOS touch icon (newer devices)
    152,  // iOS touch icon (Retina)
    180,  // iOS touch icon (high-res)
];

/**
 * Generate favicon at specified size.
 */
async function generateFavicon(size) {
    const outputPath = path.join(PROJECT_ROOT, '_site', `favicon-${size}.png`);
    
    try {
        await sharp(SOURCE_IMAGE)
            .resize(size, size)
            .toFile(outputPath);
        
        console.log(`✓ Generated favicon-${size}.png (${size}x${size})`);
        return true;
    } catch (error) {
        console.error(`✗ Failed to generate favicon-${size}.png:`, error.message);
        return false;
    }
}

/**
 * Main entry point.
 */
async function main() {
    console.log('🎨 Starting favicon generation...\n');
    
    // Check if source image exists
    try {
        await fs.access(SOURCE_IMAGE);
    } catch {
        console.error('❌ Error: Source image not found at', SOURCE_IMAGE);
        console.log('   Please ensure images/favicon.png exists.');
        process.exit(1);
    }
    
    let successCount = 0;
    for (const size of SIZES) {
        const result = await generateFavicon(size);
        if (result) successCount++;
    }
    
    console.log(`\n✅ Favicon generation complete! ${successCount}/${SIZES.length} sizes generated.`);
    console.log('\nNext steps:');
    console.log('1. Update head.njk to include all favicon sizes');
    console.log('2. Add apple-touch-icon meta tags');
    console.log('3. Consider generating .ico file for legacy browsers');
}

main().catch(console.error);
