#!/usr/bin/env node

/**
 * Generate PWA icons from SVG source
 * Usage: node scripts/generate-icons.js
 * Requires: sharp package
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '../public');

async function generateIcons() {
  try {
    console.log('🎨 Generating PWA icons...\n');

    // Icon specifications
    const icons = [
      { src: 'logo.svg', dest: 'logo-192x192.png', size: 192 },
      { src: 'logo.svg', dest: 'logo-512x512.png', size: 512 },
      { src: 'logo.svg', dest: 'apple-touch-icon.png', size: 180 },
      { src: 'logo.svg', dest: 'favicon-32x32.png', size: 32 },
    ];

    for (const icon of icons) {
      const srcPath = path.join(publicDir, icon.src);
      const destPath = path.join(publicDir, icon.dest);

      if (!fs.existsSync(srcPath)) {
        console.error(`❌ Source file not found: ${icon.src}`);
        continue;
      }

      await sharp(srcPath)
        .resize(icon.size, icon.size, {
          fit: 'contain',
          background: { r: 8, g: 13, b: 26, alpha: 1 }, // #080D1A
        })
        .png()
        .toFile(destPath);

      console.log(`✅ Generated: ${icon.dest} (${icon.size}x${icon.size})`);
    }

    // Note: favicon.ico can be generated with ImageMagick or online tools
    // For now, using favicon-32x32.png as favicon.png in manifest
    console.log('\n✨ All icons generated successfully!\n');
  } catch (error) {
    console.error('❌ Error generating icons:', error.message);
    process.exit(1);
  }
}

generateIcons();
