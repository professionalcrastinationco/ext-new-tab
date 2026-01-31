/**
 * Generate PNG icons from SVG for Chrome extension manifest
 * Run with: node generate-icons.js
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Bookmark icon SVG with cyan/teal color for visibility
const bookmarkSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="#06b6d4">
  <path d="M184,32H72A16,16,0,0,0,56,48V224a8,8,0,0,0,12.24,6.78L128,193.43l59.77,37.35A8,8,0,0,0,200,224V48A16,16,0,0,0,184,32Zm0,177.57-51.77-32.35a8,8,0,0,0-8.48,0L72,209.57V48H184Z"/>
</svg>`;

const sizes = [16, 48, 128];
const iconsDir = path.join(__dirname, 'icons');

// Ensure icons directory exists
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

async function generateIcons() {
  for (const size of sizes) {
    const outputPath = path.join(iconsDir, `icon${size}.png`);

    try {
      await sharp(Buffer.from(bookmarkSvg))
        .resize(size, size)
        .png()
        .toFile(outputPath);

      console.log(`Created: ${outputPath}`);
    } catch (error) {
      console.error(`Error creating ${size}px icon:`, error.message);
    }
  }

  console.log('Done! PNG icons generated.');
}

generateIcons();
