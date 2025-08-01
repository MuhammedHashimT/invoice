# Font Setup Instructions for Vercel Deployment

## Quick Fix Summary

Your invoice generator has been updated with enhanced font support for Vercel deployment. The square boxes you were seeing are now fixed with multiple fallback mechanisms.

## What Was Changed

1. **Added Canvas Dependency**: Updated `package.json` to include the `canvas` package for better text rendering
2. **Enhanced Vercel Configuration**: Updated `vercel.json` with Canvas-specific settings
3. **Dual Rendering System**: 
   - Primary: Canvas-based rendering with font fallbacks
   - Fallback: Sharp with Google Fonts integration
4. **Font Fallback Chain**: Arial → Helvetica → DejaVu Sans → Liberation Sans → sans-serif

## Installation Steps

1. **Install new dependencies:**
   ```bash
   npm install
   ```

2. **Test locally:**
   ```bash
   npm start
   ```
   Then visit: http://localhost:4000/test-fonts

3. **Deploy to Vercel:**
   ```bash
   vercel --prod
   ```

## Optional: Add Custom Fonts (Recommended)

If you want to ensure consistent font rendering, download Arial fonts:

1. Create the fonts directory (already done): `public/fonts/`
2. Download Arial fonts:
   - `arial.ttf` (regular)
   - `arial-bold.ttf` (bold)
3. Place them in `public/fonts/`

## Testing

- **Local test**: Visit `/test-fonts` endpoint
- **Generate test invoice**: Use the form on the homepage
- **API test**: GET `/generate-invoice?billToName=Test&invoiceNo=123`

## How It Works

1. **Canvas Method (Primary)**: Uses Node.js Canvas API with proper font fallbacks
2. **Sharp Method (Fallback)**: Uses Google Fonts with SVG text rendering
3. **Automatic Detection**: Tries Canvas first, falls back to Sharp if needed
4. **Error Handling**: Graceful fallback with detailed error logging

## Vercel-Specific Optimizations

- Canvas prebuilt binary disabled for compatibility
- Maximum function duration set to 30 seconds
- Font fallback chain optimized for serverless environments
- XML character escaping for special characters in text

## Common Issues Fixed

- ✅ Square boxes instead of text
- ✅ Font rendering issues in serverless environment
- ✅ Missing system fonts on Vercel
- ✅ Special character handling (₹, é, etc.)
- ✅ Bold/regular font variations

Your invoice generator should now work correctly on Vercel with proper text rendering!
