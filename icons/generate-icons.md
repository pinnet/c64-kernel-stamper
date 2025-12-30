# Generate PNG Icons from SVG

You can convert the `icon-template.svg` to all required PNG sizes using one of these methods:

## Method 1: Online Tools (Easiest)

1. **PWA Asset Generator** (https://github.com/elegantapp/pwa-asset-generator)
   ```bash
   npx pwa-asset-generator icon-template.svg ./icons --padding "0" --background "#0a0e1a"
   ```

2. **RealFaviconGenerator** (https://realfavicongenerator.net/)
   - Upload the SVG
   - Configure settings
   - Download all icon sizes

3. **CloudConvert** (https://cloudconvert.com/svg-to-png)
   - Upload SVG
   - Set output sizes
   - Convert and download

## Method 2: ImageMagick (Command Line)

Install ImageMagick, then run:

```bash
magick icon-template.svg -resize 72x72 icon-72x72.png
magick icon-template.svg -resize 96x96 icon-96x96.png
magick icon-template.svg -resize 128x128 icon-128x128.png
magick icon-template.svg -resize 144x144 icon-144x144.png
magick icon-template.svg -resize 152x152 icon-152x152.png
magick icon-template.svg -resize 192x192 icon-192x192.png
magick icon-template.svg -resize 384x384 icon-384x384.png
magick icon-template.svg -resize 512x512 icon-512x512.png
```

Or use this PowerShell script:

```powershell
$sizes = @(72, 96, 128, 144, 152, 192, 384, 512)
foreach ($size in $sizes) {
    magick icon-template.svg -resize "${size}x${size}" "icon-${size}x${size}.png"
}
```

## Method 3: Inkscape (GUI or CLI)

Using Inkscape GUI:
1. Open `icon-template.svg` in Inkscape
2. File → Export PNG Image
3. Set width/height to each size
4. Export with appropriate filename

Using Inkscape CLI:
```bash
inkscape icon-template.svg --export-type=png --export-filename=icon-72x72.png -w 72 -h 72
inkscape icon-template.svg --export-type=png --export-filename=icon-96x96.png -w 96 -h 96
inkscape icon-template.svg --export-type=png --export-filename=icon-128x128.png -w 128 -h 128
inkscape icon-template.svg --export-type=png --export-filename=icon-144x144.png -w 144 -h 144
inkscape icon-template.svg --export-type=png --export-filename=icon-152x152.png -w 152 -h 152
inkscape icon-template.svg --export-type=png --export-filename=icon-192x192.png -w 192 -h 192
inkscape icon-template.svg --export-type=png --export-filename=icon-384x384.png -w 384 -h 384
inkscape icon-template.svg --export-type=png --export-filename=icon-512x512.png -w 512 -h 512
```

## Method 4: Node.js with Sharp

Install Sharp: `npm install sharp`

Create `generate-icons.js`:
```javascript
const sharp = require('sharp');
const fs = require('fs');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

async function generateIcons() {
  for (const size of sizes) {
    await sharp('icon-template.svg')
      .resize(size, size)
      .png()
      .toFile(`icon-${size}x${size}.png`);
    console.log(`Generated icon-${size}x${size}.png`);
  }
}

generateIcons();
```

Run: `node generate-icons.js`

## Verify Generated Icons

After generating, verify that:
- All 8 icon sizes are created
- Icons are properly centered and not distorted
- Background is the dark gradient
- Text is readable at smaller sizes

## Quick Check

Once generated, the icons folder should contain:
- icon-72x72.png
- icon-96x96.png
- icon-128x128.png
- icon-144x144.png
- icon-152x152.png
- icon-192x192.png
- icon-384x384.png
- icon-512x512.png
