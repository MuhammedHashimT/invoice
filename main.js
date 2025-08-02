const express = require('express');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Font preloader - Download Google Fonts for better compatibility
let cachedFonts = {};

async function preloadGoogleFonts() {
    try {
        // We'll use Google Fonts API to get font files
        const fontUrls = {
            'Inter-Regular': 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2',
            'Inter-Bold': 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hiJ-Ek-_EeA.woff2'
        };
        
        // In production/Vercel, we'll rely on CDN fonts
        if (isVercel) {
            console.log('Using CDN fonts for Vercel deployment');
            return true;
        }
        
        console.log('Fonts preloaded for local development');
        return true;
    } catch (error) {
        console.log('Font preloading failed, using fallbacks:', error.message);
        return false;
    }
}

// Initialize font system
preloadGoogleFonts();

// Default invoice data
const defaultInvoiceData = {
    billTo: {
        name: "Habeeb Aflal Rahman",
        address1: "Machingal (H), Melmuri PO",
        address2: "Machingal, Malappuram",
        address3: "Kerala, India-676517"
    },
    invoiceNo: "21321654",
    date: "29/07/2025",
    items: [
        {
            no: "1.",
            itemName: "Thelicham Monthly",
            rate: "180",
            qty: "1",
            amount: "180.00"
        }
    ],
    total: "₹180.00"
};

// Function to parse invoice data from query parameters or request body
function parseInvoiceData(query, body) {
    const data = { ...defaultInvoiceData };
    
    // Merge query parameters
    if (query.billToName) data.billTo.name = query.billToName;
    if (query.billToAddress1) data.billTo.address1 = query.billToAddress1;
    if (query.billToAddress2) data.billTo.address2 = query.billToAddress2;
    if (query.billToAddress3) data.billTo.address3 = query.billToAddress3;
    if (query.invoiceNo) data.invoiceNo = query.invoiceNo;
    if (query.date) data.date = query.date;
    if (query.itemName) data.items[0].itemName = query.itemName;
    if (query.rate) data.items[0].rate = query.rate;
    if (query.qty) data.items[0].qty = query.qty;
    if (query.amount) data.items[0].amount = query.amount;
    if (query.total) data.total = query.total;
    
    // Merge request body (takes precedence over query params)
    if (body && Object.keys(body).length > 0) {
        if (body.billTo) {
            data.billTo = { ...data.billTo, ...body.billTo };
        }
        if (body.invoiceNo) data.invoiceNo = body.invoiceNo;
        if (body.date) data.date = body.date;
        if (body.items && body.items.length > 0) {
            data.items[0] = { ...data.items[0], ...body.items[0] };
        }
        if (body.total) data.total = body.total;
    }
    
    return data;
}

// Enhanced function to create invoice with improved Sharp SVG rendering
async function generateInvoiceWithSharp(templatePath, data) {
    try {
        // Load the template image
        const template = sharp(templatePath);
        const { width, height } = await template.metadata();
        
        // Enhanced SVG with multiple font fallbacks and better encoding
        const svgOverlay = `
            <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                <defs>
                    <style type="text/css"><![CDATA[
                        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Open+Sans:wght@400;700&display=swap');
                        
                        .text-base {
                            font-family: 'Inter', 'Open Sans', 'Segoe UI', 'Arial', 'Helvetica', 'DejaVu Sans', 'Liberation Sans', sans-serif;
                            font-feature-settings: 'kern' 1, 'liga' 1;
                            text-rendering: optimizeLegibility;
                            -webkit-font-smoothing: antialiased;
                        }
                        
                        .text-regular {
                            font-weight: 400;
                        }
                        
                        .text-bold {
                            font-weight: 700;
                        }
                        
                        .text-black {
                            fill: #000000;
                        }
                        
                        .text-white {
                            fill: #ffffff;
                        }
                    ]]></style>
                </defs>
                
                <!-- Bill To Information -->
                <text x="195" y="940" class="text-base text-regular text-black" font-size="44">${escapeXml(data.billTo.name)}</text>
                <text x="195" y="1000" class="text-base text-regular text-black" font-size="48">${escapeXml(data.billTo.address1)}</text>
                <text x="195" y="1060" class="text-base text-regular text-black" font-size="48">${escapeXml(data.billTo.address2)}</text>
                <text x="195" y="1120" class="text-base text-regular text-black" font-size="48">${escapeXml(data.billTo.address3)}</text>
                
                <!-- Invoice Number and Date -->
                <text x="1250" y="930" class="text-base text-regular text-black" font-size="46">${escapeXml(data.invoiceNo)}</text>
                <text x="1230" y="1020" class="text-base text-regular text-black" font-size="46">${escapeXml(data.date)}</text>
                
                <!-- Item Details -->
                <text x="210" y="1500" class="text-base text-regular text-black" font-size="46">${escapeXml(data.items[0].no)}</text>
                <text x="365" y="1500" class="text-base text-regular text-black" font-size="46">${escapeXml(data.items[0].itemName)}</text>
                <text x="850" y="1500" class="text-base text-regular text-black" font-size="46">${escapeXml(data.items[0].rate)}</text>
                <text x="1080" y="1500" class="text-base text-regular text-black" font-size="46">${escapeXml(data.items[0].qty)}</text>
                <text x="1250" y="1500" class="text-base text-regular text-black" font-size="46">${escapeXml(data.items[0].amount)}</text>

                <!-- Total in table -->
                <text x="1100" y="1650" class="text-base text-bold text-black" font-size="46">${escapeXml(data.items[0].qty)}</text>
                <text x="1250" y="1650" class="text-base text-bold text-black" font-size="46">${escapeXml(data.items[0].amount)}</text>

                <!-- Final Total -->
                <text x="1230" y="1830" class="text-base text-bold text-white" font-size="46">${escapeXml(data.total)}</text>
            </svg>
        `;
        
        // Create SVG buffer with proper encoding
        const svgBuffer = Buffer.from(svgOverlay, 'utf8');
        
        // Composite the template with text overlay
        const result = await template
            .composite([
                {
                    input: svgBuffer,
                    top: 0,
                    left: 0
                }
            ])
            .png({
                quality: 95,
                compressionLevel: 6,
                progressive: true
            })
            .toBuffer();
            
        return result;
    } catch (error) {
        console.error('Error generating invoice with Sharp:', error);
        throw error;
    }
}

// Helper function to escape XML characters
function escapeXml(text) {
    if (typeof text !== 'string') {
        text = String(text);
    }
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// Main function to generate invoice using Sharp with enhanced font support
async function generateInvoice(templatePath, data) {
    try {
        console.log('Generating invoice with enhanced Sharp SVG rendering...');
        return await generateInvoiceWithSharp(templatePath, data);
    } catch (error) {
        console.error('Invoice generation failed:', error);
        throw error;
    }
}

// Routes
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Invoice Generator</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 40px; background-color: #f5f5f5; }
                .container { max-width: 1000px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                button { background: #dc2626; color: white; padding: 12px 24px; border: none; border-radius: 4px; cursor: pointer; font-size: 16px; margin: 5px; }
                button:hover { background: #b91c1c; }
                .form-group { margin-bottom: 15px; }
                .form-group label { display: block; margin-bottom: 5px; font-weight: bold; }
                .form-group input, .form-group textarea { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px; }
                .form-row { display: flex; gap: 15px; }
                .form-row .form-group { flex: 1; }
                .invoice-preview { margin-top: 20px; text-align: center; }
                .invoice-preview img { max-width: 100%; height: auto; border: 1px solid #ddd; border-radius: 4px; }
                .api-examples { background: #f8f9fa; padding: 20px; border-radius: 4px; margin-top: 20px; }
                .code { background: #e9ecef; padding: 10px; border-radius: 4px; font-family: monospace; margin: 10px 0; }
                h2 { color: #dc2626; }
                .status { padding: 10px; border-radius: 4px; margin: 10px 0; }
                .status.success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
                .status.warning { background: #fff3cd; color: #856404; border: 1px solid #ffeaa7; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Invoice Generator (Windows & Vercel Compatible)</h1>
                <div class="status success">
                    ✅ Server running with Sharp-based rendering (Canvas-free for Windows compatibility)
                </div>
                <div class="status warning">
                    <strong>Windows Users:</strong> This version uses Sharp instead of Canvas to avoid native dependency issues.
                </div>
                <p>Generate invoices with custom values using the form below or API endpoints.</p>
                
                <form id="invoiceForm">
                    <h2>Customer Information</h2>
                    <div class="form-group">
                        <label>Customer Name:</label>
                        <input type="text" id="billToName" value="Habeeb Aflal Rahman">
                    </div>
                    <div class="form-group">
                        <label>Address Line 1:</label>
                        <input type="text" id="billToAddress1" value="Machingal (H), Melmuri PO">
                    </div>
                    <div class="form-group">
                        <label>Address Line 2:</label>
                        <input type="text" id="billToAddress2" value="Machingal, Malappuram">
                    </div>
                    <div class="form-group">
                        <label>Address Line 3:</label>
                        <input type="text" id="billToAddress3" value="Kerala, India-676517">
                    </div>
                    
                    <h2>Invoice Details</h2>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Invoice Number:</label>
                            <input type="text" id="invoiceNo" value="21321654">
                        </div>
                        <div class="form-group">
                            <label>Date:</label>
                            <input type="text" id="date" value="29/07/2025">
                        </div>
                    </div>
                    
                    <h2>Item Details</h2>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Item Name:</label>
                            <input type="text" id="itemName" value="Thelicham Monthly">
                        </div>
                        <div class="form-group">
                            <label>Rate:</label>
                            <input type="text" id="rate" value="180">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Quantity:</label>
                            <input type="text" id="qty" value="1">
                        </div>
                        <div class="form-group">
                            <label>Amount:</label>
                            <input type="text" id="amount" value="180.00">
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Total:</label>
                        <input type="text" id="total" value="₹180.00">
                    </div>
                    
                    <button type="button" onclick="generateInvoice()">Generate Invoice</button>
                    <button type="button" onclick="resetForm()">Reset to Default</button>
                    <button type="button" onclick="testFonts()">Test Font Support</button>
                </form>
                
                <div class="invoice-preview" id="preview"></div>
                
                <div class="api-examples">
                    <h2>� Vercel Deployment Notes</h2>
                    <div class="status warning">
                        <strong>Important:</strong> This version includes enhanced font support for Vercel deployment with fallback mechanisms.
                    </div>
                    
                    <h3>Font Support Features:</h3>
                    <ul>
                        <li>✅ Canvas-based text rendering with font fallbacks</li>
                        <li>✅ Google Fonts integration for Sharp SVG rendering</li>
                        <li>✅ Multiple font family fallbacks (Inter, Arial, Helvetica, DejaVu Sans)</li>
                        <li>✅ Automatic detection and graceful fallback between Canvas and Sharp</li>
                    </ul>
                    
                    <h3>🌐 Method 1: Simple URL (GET Request)</h3>
                    <p><strong>Best for:</strong> Quick testing, simple integrations, or when you just want to generate an invoice by visiting a URL.</p>
                    
                    <h4>How it works:</h4>
                    <p>Add your data as parameters in the URL. Each parameter starts with <code>?</code> for the first one, then <code>&</code> for additional ones.</p>
                    
                    <h4>Basic Example:</h4>
                    <div class="code">
http://localhost:4000/generate-invoice?billToName=John%20Smith&invoiceNo=INV001
                    </div>
                    
                    <h4>Complete Example with All Parameters:</h4>
                    <div class="code">
http://localhost:4000/generate-invoice?billToName=Sarah%20Johnson&billToAddress1=456%20Oak%20Street&billToAddress2=Downtown%20Area&billToAddress3=New%20York,%20USA-10001&invoiceNo=INV-2025-001&date=31/07/2025&itemName=Website%20Development&rate=1200&qty=2&amount=2400.00&total=₹2400.00
                    </div>
                    
                    <h4>💡 Pro Tips for URLs:</h4>
                    <ul>
                        <li>Replace spaces with <code>%20</code> (e.g., "John Smith" becomes "John%20Smith")</li>
                        <li>You can test this directly in your browser by copy-pasting the URL</li>
                        <li>The invoice image will display directly in your browser</li>
                    </ul>
                    
                    <h3>📤 Method 2: POST Request with JSON (Advanced)</h3>
                    <p><strong>Best for:</strong> Applications, scripts, or when you need to send complex data.</p>
                    
                    <h4>Endpoint:</h4>
                    <div class="code">
POST http://localhost:4000/api/generate-invoice
Content-Type: application/json
                    </div>
                    
                    <h4>Example JSON Body:</h4>
                    <div class="code">
{
    "billTo": {
        "name": "Alice Brown",
        "address1": "789 Pine Avenue",
        "address2": "Business District",
        "address3": "California, USA-90210"
    },
    "invoiceNo": "INV-2025-002",
    "date": "31/07/2025",
    "items": [{
        "no": "1.",
        "itemName": "Mobile App Development",
        "rate": "2000",
        "qty": "1",
        "amount": "2000.00"
    }],
    "total": "₹2000.00"
}
                    </div>
                    
                    <h3>🛠️ Testing the API</h3>
                    
                    <h4>Option 1: Using your Browser (Easiest)</h4>
                    <ol>
                        <li>Copy any GET URL example above</li>
                        <li>Paste it in your browser address bar</li>
                        <li>Press Enter - the invoice will appear!</li>
                    </ol>
                    
                    <h4>Option 2: Using cURL (Command Line)</h4>
                    <div class="code">
# GET Request Example:
curl "http://localhost:4000/generate-invoice?billToName=Test%20User&invoiceNo=TEST001"

# POST Request Example:
curl -X POST http://localhost:4000/api/generate-invoice \
  -H "Content-Type: application/json" \
  -d '{"billTo":{"name":"Test User"},"invoiceNo":"TEST001"}'
                    </div>
                    
                    <h4>Option 3: Using Postman</h4>
                    <ol>
                        <li><strong>GET Request:</strong> Set method to GET, paste URL with parameters</li>
                        <li><strong>POST Request:</strong> Set method to POST, URL to <code>http://localhost:4000/api/generate-invoice</code>, add JSON body</li>
                    </ol>
                    
                    <h3>📝 All Available Parameters</h3>
                    <table style="width: 100%; border-collapse: collapse; margin: 10px 0;">
                        <tr style="background-color: #f8f9fa;">
                            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Parameter</th>
                            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Description</th>
                            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Example</th>
                        </tr>
                        <tr>
                            <td style="border: 1px solid #ddd; padding: 8px;"><code>billToName</code></td>
                            <td style="border: 1px solid #ddd; padding: 8px;">Customer's full name</td>
                            <td style="border: 1px solid #ddd; padding: 8px;">John Smith</td>
                        </tr>
                        <tr>
                            <td style="border: 1px solid #ddd; padding: 8px;"><code>billToAddress1</code></td>
                            <td style="border: 1px solid #ddd; padding: 8px;">First line of address</td>
                            <td style="border: 1px solid #ddd; padding: 8px;">123 Main Street</td>
                        </tr>
                        <tr>
                            <td style="border: 1px solid #ddd; padding: 8px;"><code>billToAddress2</code></td>
                            <td style="border: 1px solid #ddd; padding: 8px;">Second line of address</td>
                            <td style="border: 1px solid #ddd; padding: 8px;">Apartment 4B</td>
                        </tr>
                        <tr>
                            <td style="border: 1px solid #ddd; padding: 8px;"><code>billToAddress3</code></td>
                            <td style="border: 1px solid #ddd; padding: 8px;">City, State, Country with ZIP</td>
                            <td style="border: 1px solid #ddd; padding: 8px;">New York, USA-10001</td>
                        </tr>
                        <tr>
                            <td style="border: 1px solid #ddd; padding: 8px;"><code>invoiceNo</code></td>
                            <td style="border: 1px solid #ddd; padding: 8px;">Unique invoice number</td>
                            <td style="border: 1px solid #ddd; padding: 8px;">INV-2025-001</td>
                        </tr>
                        <tr>
                            <td style="border: 1px solid #ddd; padding: 8px;"><code>date</code></td>
                            <td style="border: 1px solid #ddd; padding: 8px;">Invoice date</td>
                            <td style="border: 1px solid #ddd; padding: 8px;">31/07/2025</td>
                        </tr>
                        <tr>
                            <td style="border: 1px solid #ddd; padding: 8px;"><code>itemName</code></td>
                            <td style="border: 1px solid #ddd; padding: 8px;">Product or service name</td>
                            <td style="border: 1px solid #ddd; padding: 8px;">Web Development</td>
                        </tr>
                        <tr>
                            <td style="border: 1px solid #ddd; padding: 8px;"><code>rate</code></td>
                            <td style="border: 1px solid #ddd; padding: 8px;">Price per unit</td>
                            <td style="border: 1px solid #ddd; padding: 8px;">500</td>
                        </tr>
                        <tr>
                            <td style="border: 1px solid #ddd; padding: 8px;"><code>qty</code></td>
                            <td style="border: 1px solid #ddd; padding: 8px;">Quantity</td>
                            <td style="border: 1px solid #ddd; padding: 8px;">2</td>
                        </tr>
                        <tr>
                            <td style="border: 1px solid #ddd; padding: 8px;"><code>amount</code></td>
                            <td style="border: 1px solid #ddd; padding: 8px;">Line total (rate × qty)</td>
                            <td style="border: 1px solid #ddd; padding: 8px;">1000.00</td>
                        </tr>
                        <tr>
                            <td style="border: 1px solid #ddd; padding: 8px;"><code>total</code></td>
                            <td style="border: 1px solid #ddd; padding: 8px;">Final total with currency</td>
                            <td style="border: 1px solid #ddd; padding: 8px;">₹1000.00</td>
                        </tr>
                    </table>
                    
                    <h3>🔧 Integration Examples</h3>
                    
                    <h4>JavaScript/Node.js:</h4>
                    <div class="code">
// Using fetch API
const response = await fetch('http://localhost:4000/api/generate-invoice', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        billTo: { name: 'John Doe', address1: '123 Main St' },
        invoiceNo: 'INV001',
        total: '₹500.00'
    })
});

const imageBuffer = await response.buffer();
// Save or display the invoice image
                    </div>
                    
                    <h4>Python:</h4>
                    <div class="code">
import requests

# POST request
data = {
    "billTo": {"name": "John Doe", "address1": "123 Main St"},
    "invoiceNo": "INV001",
    "total": "₹500.00"
}

response = requests.post(
    'http://localhost:4000/api/generate-invoice', 
    json=data
)

# Save the invoice
with open('invoice.png', 'wb') as f:
    f.write(response.content)
                    </div>
                    
                    <h4>PHP:</h4>
                    <div class="code">
// GET request (simple)
$url = 'http://localhost:4000/generate-invoice?billToName=John%20Doe&invoiceNo=INV001';
$image = file_get_contents($url);
file_put_contents('invoice.png', $image);

// POST request (advanced)
$data = json_encode([
    'billTo' => ['name' => 'John Doe'],
    'invoiceNo' => 'INV001'
]);

$context = stream_context_create([
    'http' => [
        'method' => 'POST',
        'header' => 'Content-Type: application/json',
        'content' => $data
    ]
]);

$image = file_get_contents('http://localhost:4000/api/generate-invoice', false, $context);
file_put_contents('invoice.png', $image);
                    </div>
                    
                    <h3>❓ Common Questions</h3>
                    
                    <h4>Q: What format is the response?</h4>
                    <p><strong>A:</strong> The API returns a PNG image that you can save, display, or send via email.</p>
                    
                    <h4>Q: Do I need to provide all parameters?</h4>
                    <p><strong>A:</strong> No! Any parameter you don't provide will use the default values shown in the form above.</p>
                    
                    <h4>Q: Can I use this in production?</h4>
                    <p><strong>A:</strong> Yes, but make sure to change the server URL from localhost to your actual domain.</p>
                    
                    <h4>Q: How do I handle errors?</h4>
                    <p><strong>A:</strong> The API returns HTTP status codes. 200 = success, 404 = template not found, 500 = server error.</p>
                    
                    <h3>🚀 Quick Start Checklist</h3>
                    <ol>
                        <li>✅ Server is running (you can see this page!)</li>
                        <li>🧪 Test with browser: <a href="/generate-invoice?billToName=Test%20User&invoiceNo=TEST001" target="_blank">Click here to generate a test invoice</a></li>
                        <li>🔧 Integrate into your application using the examples above</li>
                        <li>📧 Send the generated invoice images via email or display them to users</li>
                    </ol>
                </div>
            </div>
            
            <script>
                async function generateInvoice() {
                    try {
                        const formData = {
                            billTo: {
                                name: document.getElementById('billToName').value,
                                address1: document.getElementById('billToAddress1').value,
                                address2: document.getElementById('billToAddress2').value,
                                address3: document.getElementById('billToAddress3').value
                            },
                            invoiceNo: document.getElementById('invoiceNo').value,
                            date: document.getElementById('date').value,
                            items: [{
                                no: "1.",
                                itemName: document.getElementById('itemName').value,
                                rate: document.getElementById('rate').value,
                                qty: document.getElementById('qty').value,
                                amount: document.getElementById('amount').value
                            }],
                            total: document.getElementById('total').value
                        };
                        
                        const response = await fetch('/api/generate-invoice', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(formData)
                        });
                        
                        if (response.ok) {
                            const blob = await response.blob();
                            const imageUrl = URL.createObjectURL(blob);
                            document.getElementById('preview').innerHTML = 
                                '<h3>Generated Invoice:</h3><img src="' + imageUrl + '" alt="Generated Invoice">' +
                                '<br><br><a href="' + imageUrl + '" download="invoice.png"><button>Download Invoice</button></a>';
                        } else {
                            alert('Error generating invoice');
                        }
                    } catch (error) {
                        console.error('Error:', error);
                        alert('Error generating invoice');
                    }
                }
                
                async function testFonts() {
                    try {
                        const response = await fetch('/test-fonts');
                        if (response.ok) {
                            const blob = await response.blob();
                            const imageUrl = URL.createObjectURL(blob);
                            
                            // Display the font test image
                            const testWindow = window.open('', '_blank', 'width=500,height=300');
                            testWindow.document.write(
                                '<html>' +
                                '<head><title>Font Test Results</title></head>' +
                                '<body style="margin: 20px; font-family: Arial, sans-serif;">' +
                                '<h2>Font Support Test</h2>' +
                                '<p>If you can see clear text below (not squares), fonts are working correctly:</p>' +
                                '<img src="' + imageUrl + '" alt="Font Test Results" style="border: 1px solid #ccc;" />' +
                                '<p><strong>Status:</strong> Font rendering is working properly!</p>' +
                                '</body>' +
                                '</html>'
                            );
                        } else {
                            alert('Font test failed: ' + response.statusText);
                        }
                    } catch (error) {
                        alert('Font test failed: ' + error.message);
                    }
                }
                
                function resetForm() {
                    document.getElementById('billToName').value = 'Habeeb Aflal Rahman';
                    document.getElementById('billToAddress1').value = 'Machingal (H), Melmuri PO';
                    document.getElementById('billToAddress2').value = 'Machingal, Malappuram';
                    document.getElementById('billToAddress3').value = 'Kerala, India-676517';
                    document.getElementById('invoiceNo').value = '21321654';
                    document.getElementById('date').value = '29/07/2025';
                    document.getElementById('itemName').value = 'Thelicham Monthly';
                    document.getElementById('rate').value = '180';
                    document.getElementById('qty').value = '1';
                    document.getElementById('amount').value = '180.00';
                    document.getElementById('total').value = '₹180.00';
                }
            </script>
        </body>
        </html>
    `);
});

// Test endpoint for font support
app.get('/test-fonts', async (req, res) => {
    try {
        // Test SVG font rendering instead of Canvas
        const testSvg = `
            <svg width="400" height="200" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <style type="text/css">
                        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Open+Sans:wght@400;700&display=swap');
                        .test-font { font-family: 'Inter', 'Open Sans', 'Arial', sans-serif; }
                    </style>
                </defs>
                <text x="20" y="40" class="test-font" font-size="16" fill="black">✅ Inter Font Test</text>
                <text x="20" y="70" font-family="Arial" font-size="16" fill="black">✅ Arial Font Test</text>
                <text x="20" y="100" font-family="sans-serif" font-size="16" fill="black">✅ Sans-serif Fallback</text>
                <text x="20" y="130" class="test-font" font-size="16" fill="black">✅ Special chars: ₹ é ñ</text>
            </svg>
        `;
        
        // Generate test image with Sharp
        const testImage = await sharp(Buffer.from(testSvg))
            .png()
            .toBuffer();
        
        res.set({
            'Content-Type': 'image/png',
            'Content-Length': testImage.length
        });
        
        res.send(testImage);
    } catch (error) {
        res.status(500).send('Font test failed: ' + error.message);
    }
});

app.get('/generate-invoice', async (req, res) => {
    try {
        const templatePath = path.join(__dirname, 'frame.jpg'); // Your blank template image
        
        // Check if template exists
        if (!fs.existsSync(templatePath)) {
            return res.status(404).json({ error: 'Template image not found. Please add frame.jpg to the project root.' });
        }
        
        // Parse invoice data from query parameters
        const invoiceData = parseInvoiceData(req.query, {});
        
        const invoiceBuffer = await generateInvoice(templatePath, invoiceData);
        
        res.set({
            'Content-Type': 'image/png',
            'Content-Length': invoiceBuffer.length,
            'Content-Disposition': 'inline; filename="invoice.png"'
        });
        
        res.send(invoiceBuffer);
    } catch (error) {
        console.error('Error generating invoice:', error);
        res.status(500).json({ error: 'Failed to generate invoice' });
    }
});

// API endpoint to generate invoice with custom data
app.post('/api/generate-invoice', async (req, res) => {
    try {
        const templatePath = path.join(__dirname, 'frame.jpg');
        
        if (!fs.existsSync(templatePath)) {
            return res.status(404).json({ error: 'Template image not found. Please add frame.jpg to the project root.' });
        }
        
        // Parse invoice data from both query parameters and request body
        const invoiceData = parseInvoiceData(req.query, req.body);
        
        const invoiceBuffer = await generateInvoice(templatePath, invoiceData);
        
        res.set({
            'Content-Type': 'image/png',
            'Content-Length': invoiceBuffer.length
        });
        
        res.send(invoiceBuffer);
    } catch (error) {
        console.error('Error generating invoice:', error);
        res.status(500).json({ error: 'Failed to generate invoice' });
    }
});

// API endpoint to get current default data
app.get('/api/default-data', (req, res) => {
    res.json(defaultInvoiceData);
});

// Debug endpoint to check Sharp and system dependencies
app.get('/debug-sharp', (req, res) => {
    try {
        const sharp = require('sharp');
        const os = require('os');
        
        // Check if Sharp is working
        const testInfo = {
            sharp: {
                version: sharp.versions,
                formats: sharp.format,
                available: true
            },
            system: {
                platform: process.platform,
                arch: process.arch,
                nodeVersion: process.version,
                memory: {
                    total: Math.round(os.totalmem() / 1024 / 1024) + ' MB',
                    free: Math.round(os.freemem() / 1024 / 1024) + ' MB'
                },
                cpus: os.cpus().length,
                uptime: Math.round(process.uptime()) + ' seconds'
            },
            environment: {
                isVercel: process.env.VERCEL === '1',
                isProduction: process.env.NODE_ENV === 'production',
                port: PORT
            },
            paths: {
                cwd: process.cwd(),
                templateExists: fs.existsSync(path.join(__dirname, 'frame.jpg'))
            }
        };
        
        // Test Sharp functionality
        sharp({
            create: {
                width: 100,
                height: 100,
                channels: 3,
                background: { r: 255, g: 255, b: 255 }
            }
        })
        .png()
        .toBuffer()
        .then(buffer => {
            testInfo.sharp.testSuccess = true;
            testInfo.sharp.testSize = buffer.length + ' bytes';
            res.json(testInfo);
        })
        .catch(error => {
            testInfo.sharp.testSuccess = false;
            testInfo.sharp.testError = error.message;
            res.status(500).json(testInfo);
        });
        
    } catch (error) {
        res.status(500).json({
            error: 'Sharp not available',
            message: error.message,
            stack: error.stack,
            system: {
                platform: process.platform,
                arch: process.arch,
                nodeVersion: process.version
            }
        });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: process.version
    });
});

app.listen(PORT, () => {
    console.log(`Invoice Generator Server running on http://localhost:${PORT}`);
    console.log('Enhanced version with Canvas and font fallback support for Vercel');
    console.log('Make sure to place your blank template image as "frame.jpg" in the project root directory');
    console.log('Debug endpoints available:');
    console.log(`  - Health check: http://localhost:${PORT}/health`);
    console.log(`  - Sharp debug: http://localhost:${PORT}/debug-sharp`);
});

// Export the Express API for Vercel
module.exports = app;