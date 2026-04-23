const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const publicDir = path.join(__dirname, '../public');
const icoPath = path.join(publicDir, 'logo.ico');

async function extractAndConvert() {
  console.log('📦 Extracting PNG from ICO...\n');

  const buf = fs.readFileSync(icoPath);

  // ICO header: 6 bytes, then directory entries of 16 bytes each
  const imageCount = buf.readUInt16LE(4);
  console.log(`Found ${imageCount} image(s) in ICO\n`);

  let bestOffset = 0;
  let bestSize = 0;
  let bestBytes = 0;

  for (let i = 0; i < imageCount; i++) {
    const dirOffset = 6 + i * 16;
    const width = buf[dirOffset] || 256;
    const height = buf[dirOffset + 1] || 256;
    const bytesInRes = buf.readUInt32LE(dirOffset + 8);
    const imageOffset = buf.readUInt32LE(dirOffset + 12);

    console.log(`  Image ${i}: ${width}x${height}, ${bytesInRes} bytes at offset ${imageOffset}`);

    if (width * height > bestSize) {
      bestSize = width * height;
      bestOffset = imageOffset;
      bestBytes = bytesInRes;
    }
  }

  // Extract largest image data
  const imageData = buf.slice(bestOffset, bestOffset + bestBytes);

  // Check if it's a PNG (starts with PNG signature)
  const isPNG = imageData[0] === 0x89 && imageData[1] === 0x50;
  console.log(`\n📌 Largest image is ${isPNG ? 'PNG' : 'BMP'} format`);

  // Save extracted image
  const extractedPath = path.join(publicDir, 'logo-extracted.png');
  fs.writeFileSync(extractedPath, imageData);
  console.log(`✅ Extracted to logo-extracted.png`);

  // Now convert to all sizes with sharp
  const sizes = [
    { name: 'logo-512x512.png', size: 512 },
    { name: 'logo-192x192.png', size: 192 },
    { name: 'apple-touch-icon.png', size: 180 },
    { name: 'favicon-32x32.png', size: 32 },
  ];

  console.log('\n🎨 Generating PWA icons...\n');

  for (const icon of sizes) {
    await sharp(extractedPath)
      .resize(icon.size, icon.size, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 },
      })
      .png()
      .toFile(path.join(publicDir, icon.name));
    console.log(`✅ ${icon.name} (${icon.size}x${icon.size})`);
  }

  // Copy ICO as favicon
  fs.copyFileSync(icoPath, path.join(__dirname, '../app/favicon.ico'));
  console.log('✅ app/favicon.ico');

  console.log('\n✨ All done!');
}

extractAndConvert().catch(console.error);
