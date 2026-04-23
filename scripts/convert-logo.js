#!/usr/bin/env node

const sharp = require('sharp');
const path = require('path');

const publicDir = path.join(__dirname, '../public');

async function convertLogo() {
  console.log('🎨 Converting logo to PNG icons...\n');

  const sizes = [
    { name: 'logo-192x192.png', size: 192 },
    { name: 'logo-512x512.png', size: 512 },
    { name: 'apple-touch-icon.png', size: 180 },
    { name: 'favicon-32x32.png', size: 32 },
  ];

  for (const icon of sizes) {
    try {
      // Read from stdin (piped image) and convert
      const buffer = await new Promise((resolve, reject) => {
        const chunks = [];
        process.stdin.on('data', chunk => chunks.push(chunk));
        process.stdin.on('end', () => resolve(Buffer.concat(chunks)));
        process.stdin.on('error', reject);
      });

      await sharp(buffer)
        .resize(icon.size, icon.size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 },
        })
        .png()
        .toFile(path.join(publicDir, icon.name));

      console.log(`✅ Generated: ${icon.name} (${icon.size}x${icon.size})`);
    } catch (error) {
      console.error(`❌ Error with ${icon.name}:`, error.message);
    }
  }

  console.log('\n✨ Logo conversion complete!');
}

convertLogo();
