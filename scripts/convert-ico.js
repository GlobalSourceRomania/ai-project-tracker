const { Jimp } = require('jimp');
const path = require('path');
const fs = require('fs');

const publicDir = path.join(__dirname, '../public');
const src = path.join(publicDir, 'logo.ico');

const icons = [
  { name: 'logo-512x512.png', size: 512 },
  { name: 'logo-192x192.png', size: 192 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'favicon-32x32.png', size: 32 },
];

async function convert() {
  console.log('🎨 Converting logo.ico to PNG icons...\n');

  const image = await Jimp.read(src);

  for (const icon of icons) {
    await image
      .clone()
      .resize({ w: icon.size, h: icon.size })
      .write(path.join(publicDir, icon.name));
    console.log(`✅ ${icon.name} (${icon.size}x${icon.size})`);
  }

  // Copy ICO to app/favicon.ico
  fs.copyFileSync(src, path.join(__dirname, '../app/favicon.ico'));
  console.log('✅ app/favicon.ico');

  console.log('\n✨ Done!');
}

convert().catch(console.error);
