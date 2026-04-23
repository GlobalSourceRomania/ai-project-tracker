#!/usr/bin/env node

const sharp = require('sharp');
const https = require('https');
const http = require('http');
const path = require('path');
const fs = require('fs');

const imageUrl = process.argv[2];

if (!imageUrl) {
  console.error('❌ Usage: node scripts/convert-logo-from-url.js <image-url-or-file-path>');
  process.exit(1);
}

const publicDir = path.join(__dirname, '../public');

async function convertLogo(imageBuffer) {
  console.log('🎨 Converting logo to PNG icons...\n');

  const sizes = [
    { name: 'logo-192x192.png', size: 192 },
    { name: 'logo-512x512.png', size: 512 },
    { name: 'apple-touch-icon.png', size: 180 },
    { name: 'favicon-32x32.png', size: 32 },
  ];

  for (const icon of sizes) {
    try {
      await sharp(imageBuffer)
        .resize(icon.size, icon.size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 1 },
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

// Check if local file
if (fs.existsSync(imageUrl)) {
  console.log(`📂 Reading local file: ${imageUrl}`);
  fs.readFile(imageUrl, (err, data) => {
    if (err) {
      console.error('❌ File read failed:', err.message);
      process.exit(1);
    }
    convertLogo(data);
  });
} else if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
  console.log(`🌐 Downloading from: ${imageUrl}`);
  const protocol = imageUrl.startsWith('https') ? https : http;

  protocol.get(imageUrl, (response) => {
    const chunks = [];
    response.on('data', chunk => chunks.push(chunk));
    response.on('end', () => {
      const buffer = Buffer.concat(chunks);
      convertLogo(buffer);
    });
  }).on('error', (err) => {
    console.error('❌ Download failed:', err.message);
    process.exit(1);
  });
} else {
  console.error('❌ Invalid path or URL:', imageUrl);
  process.exit(1);
}
