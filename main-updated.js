const express = require('express');
const path = require('path');
const fs = require('fs');
const { createCanvas, loadImage } = require('canvas');

const app = express();
const PORT = 4000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname)); // Serve static files including images

// Invoice generation endpoint
app.get('/generate-invoice', async (req, res) => {
    try {
        // Extract parameters from query string
        const {
            billTo = 'Habeeb Aflal Rahman',
            address1 = 'Machingal (H), Melmuri PO',
            address2 = 'Machingal, Malappuram',
            address3 = 'Kerala, India-676517',
            invoiceNo = '21321654',
            date = '29/07/2025',
            itemName = 'Tholicham Monthly',
            rate = '180',
            qty = '1',
            amount = '180.00'
        } = req.query;

        const totalAmount = parseFloat(amount);

        // Load the frame image
        const frameImagePath = path.join(__dirname, 'frame.jpg');
        const frameImage = await loadImage(frameImagePath);
        
        // Create canvas with the same dimensions as the frame
        const canvas = createCanvas(frameImage.width, frameImage.height);
        const ctx = canvas.getContext('2d');
        
        // Draw the frame image as background
        ctx.drawImage(frameImage, 0, 0);
        
        // Set text properties
        ctx.fillStyle = 'black';
        ctx.textAlign = 'left';
        
        // Add bill to information (positioned to match the template)
        ctx.font = '14px Arial';
        ctx.fillText(billTo, 100, 420);
        ctx.fillText(address1, 100, 440);
        ctx.fillText(address2, 100, 460);
        ctx.fillText(address3, 100, 480);
        
        // Add invoice details (right side, positioned to match template)
        ctx.textAlign = 'left';
        ctx.font = '14px Arial';
        ctx.fillText(invoiceNo, frameImage.width - 150, 420);
        ctx.fillText(date, frameImage.width - 150, 470);
        
        // Add table content (positioned to match the table in template)
        ctx.textAlign = 'left';
        ctx.font = '14px Arial';
        
        // Table row - positioned to align with the red table headers
        const tableY = 600;
        ctx.fillText('1', 100, tableY);
        ctx.fillText(itemName, 180, tableY);
        ctx.fillText(rate, 380, tableY);
        ctx.fillText(qty, 460, tableY);
        ctx.fillText(amount, 520, tableY);
        
        // Total row - positioned below the main table row
        const totalY = tableY + 80;
        ctx.fillText('Total', 300, totalY);
        ctx.fillText(qty, 460, totalY);
        ctx.fillText(totalAmount.toFixed(2), 520, totalY);
        
        // Final total - positioned to align with the red total box on the right
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'white';
        ctx.fillText(`Total  ₹${totalAmount.toFixed(2)}`, frameImage.width - 100, totalY + 60);
        
        // Convert canvas to buffer
        const buffer = canvas.toBuffer('image/png');
        
        // Set response headers for image
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Content-Disposition', `attachment; filename="invoice-${invoiceNo}.png"`);
        
        // Send image
        res.send(buffer);

    } catch (error) {
        console.error('Error generating invoice:', error);
        res.status(500).json({ error: 'Failed to generate invoice', details: error.message });
    }
});

// Preview endpoint to view the invoice as image
app.get('/preview', async (req, res) => {
    try {
        // Use default values for preview
        const {
            billTo = 'Habeeb Aflal Rahman',
            address1 = 'Machingal (H), Melmuri PO',
            address2 = 'Machingal, Malappuram',
            address3 = 'Kerala, India-676517',
            invoiceNo = '21321654',
            date = '29/07/2025',
            itemName = 'Tholicham Monthly',
            rate = '180',
            qty = '1',
            amount = '180.00'
        } = req.query;

        const totalAmount = parseFloat(amount);

        // Load the frame image
        const frameImagePath = path.join(__dirname, 'frame.jpg');
        const frameImage = await loadImage(frameImagePath);
        
        // Create canvas with the same dimensions as the frame
        const canvas = createCanvas(frameImage.width, frameImage.height);
        const ctx = canvas.getContext('2d');
        
        // Draw the frame image as background
        ctx.drawImage(frameImage, 0, 0);
        
        // Set text properties
        ctx.fillStyle = 'black';
        ctx.textAlign = 'left';
        
        // Add bill to information (positioned to match the template)
        ctx.font = '14px Arial';
        ctx.fillText(billTo, 100, 420);
        ctx.fillText(address1, 100, 440);
        ctx.fillText(address2, 100, 460);
        ctx.fillText(address3, 100, 480);
        
        // Add invoice details (right side, positioned to match template)
        ctx.textAlign = 'left';
        ctx.font = '14px Arial';
        ctx.fillText(invoiceNo, frameImage.width - 150, 420);
        ctx.fillText(date, frameImage.width - 150, 470);
        
        // Add table content (positioned to match the table in template)
        ctx.textAlign = 'left';
        ctx.font = '14px Arial';
        
        // Table row - positioned to align with the red table headers
        const tableY = 600;
        ctx.fillText('1', 100, tableY);
        ctx.fillText(itemName, 180, tableY);
        ctx.fillText(rate, 380, tableY);
        ctx.fillText(qty, 460, tableY);
        ctx.fillText(amount, 520, tableY);
        
        // Total row - positioned below the main table row
        const totalY = tableY + 80;
        ctx.fillText('Total', 300, totalY);
        ctx.fillText(qty, 460, totalY);
        ctx.fillText(totalAmount.toFixed(2), 520, totalY);
        
        // Final total - positioned to align with the red total box on the right
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'white';
        ctx.fillText(`Total  ₹${totalAmount.toFixed(2)}`, frameImage.width - 100, totalY + 60);
        
        // Convert canvas to buffer
        const buffer = canvas.toBuffer('image/png');
        
        // Set response headers for image display
        res.setHeader('Content-Type', 'image/png');
        
        // Send image for browser display
        res.send(buffer);

    } catch (error) {
        console.error('Error generating preview:', error);
        res.status(500).json({ error: 'Failed to generate preview', details: error.message });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Invoice generator is running' });
});

// Root endpoint with usage instructions
app.get('/', (req, res) => {
    res.json({
        message: 'Invoice Generator API - Using Canvas to overlay data on frame.jpg',
        usage: 'GET /generate-invoice with query parameters',
        parameters: {
            billTo: 'Customer name (optional)',
            address1: 'Address line 1 (optional)',
            address2: 'Address line 2 (optional)', 
            address3: 'Address line 3 (optional)',
            invoiceNo: 'Invoice number (optional)',
            date: 'Invoice date (optional)',
            itemName: 'Item/service name (optional)',
            rate: 'Rate per item (optional)',
            qty: 'Quantity (optional)',
            amount: 'Total amount (optional)'
        },
        example: '/generate-invoice?billTo=John%20Doe&invoiceNo=12345&amount=250.00',
        preview: '/preview - View invoice with default data'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Invoice Generator API running on http://localhost:${PORT}`);
    console.log(`Generate invoice: http://localhost:${PORT}/generate-invoice`);
    console.log(`Health check: http://localhost:${PORT}/health`);
});

module.exports = app;
