# Invoice Generator API

A Node.js Express application to generate invoices by overlaying text on template images using Sharp.

## Features

- Generate invoices with custom data
- REST API endpoints (GET and POST)
- Web interface for easy testing
- Image processing with Sharp
- Vercel deployment ready

## Local Development

1. Install dependencies:
```bash
npm install
```

2. Place your template image as `frame.jpg` in the project root

3. Start the server:
```bash
npm start
# or for development with auto-reload
npm run dev
```

4. Open http://localhost:4000 in your browser

## Vercel Deployment

### Prerequisites
- Vercel account (free at vercel.com)
- Git repository

### Quick Deploy

1. **Push to GitHub:**
```bash
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

2. **Deploy to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will automatically detect it's a Node.js project
   - Click "Deploy"

3. **Upload Template Image:**
   - After deployment, you need to include `frame.jpg` in your repository
   - Commit and push the image file

### Using Vercel CLI (Alternative)

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy:
```bash
vercel
```

4. Follow the prompts and your app will be deployed!

## API Documentation

### Endpoints

#### GET /generate-invoice
Generate invoice with URL parameters.

**Example:**
```
https://your-app.vercel.app/generate-invoice?billToName=John%20Doe&invoiceNo=INV001&total=₹500.00
```

#### POST /api/generate-invoice
Generate invoice with JSON body.

**Example:**
```json
{
    "billTo": {
        "name": "John Doe",
        "address1": "123 Main St"
    },
    "invoiceNo": "INV001",
    "total": "₹500.00"
}
```

### Parameters
- `billToName` - Customer name
- `billToAddress1` - Address line 1
- `billToAddress2` - Address line 2  
- `billToAddress3` - Address line 3
- `invoiceNo` - Invoice number
- `date` - Invoice date
- `itemName` - Item/service name
- `rate` - Price per unit
- `qty` - Quantity
- `amount` - Line total
- `total` - Final total

## Files Structure

```
├── main.js              # Main Express application
├── package.json         # Dependencies and scripts
├── vercel.json         # Vercel configuration
├── frame.jpg           # Invoice template image
├── .gitignore          # Git ignore rules
└── README.md           # This file
```

## Important Notes

- The `frame.jpg` template image must be in the project root
- Sharp library works with PNG, JPEG, WebP, and other formats
- All coordinates in the SVG overlay are positioned for the specific template
- Vercel has a 50MB limit for deployments

## Troubleshooting

### Template Not Found Error
Make sure `frame.jpg` is in your project root and committed to git.

### Sharp Installation Issues on Vercel
Sharp should work automatically on Vercel. If issues occur, Vercel will rebuild it for the platform.

### Image Not Displaying
Check that your template image path is correct and the file exists.

## Environment Variables

No environment variables are required for basic functionality. The app will run on Vercel's assigned port automatically.

## License

MIT
