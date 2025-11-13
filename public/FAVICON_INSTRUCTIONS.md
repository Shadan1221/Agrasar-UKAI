# Favicon Conversion Instructions

The Agrasar logo has been created as an SVG file (`favicon.svg`). To convert it to ICO format for better browser compatibility:

## Option 1: Online Converter (Recommended)
1. Visit https://convertio.co/svg-ico/ or https://cloudconvert.com/svg-to-ico
2. Upload `public/favicon.svg`
3. Download the converted `favicon.ico`
4. Replace `public/favicon.ico` with the new file

## Option 2: Using ImageMagick (Command Line)
```bash
magick convert favicon.svg -resize 32x32 favicon.ico
```

## Option 3: Using Inkscape
1. Open `favicon.svg` in Inkscape
2. File > Export PNG Image (set size to 32x32 or 16x16)
3. Use an online PNG to ICO converter

## Current Setup
- `favicon.svg` - Modern browsers (Chrome, Firefox, Edge)
- `favicon.ico` - Fallback for older browsers
- The SVG favicon will work in most modern browsers

The HTML already includes both formats:
- `<link rel="icon" type="image/svg+xml" href="/favicon.svg" />` - Primary (modern)
- `<link rel="alternate icon" type="image/x-icon" href="/favicon.ico" />` - Fallback

