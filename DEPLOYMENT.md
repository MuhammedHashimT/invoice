# 🚀 Server Deployment Guide for Invoice Generator

This guide helps you deploy your Invoice Generator on various hosting platforms and diagnose common issues.

## 🔍 Quick Diagnosis

First, diagnose any issues with your current setup:

```bash
# Make scripts executable (Linux/Mac)
chmod +x diagnose.sh setup-server.sh

# Run diagnosis
npm run diagnose
# or
./diagnose.sh
```

## 🛠️ Server Setup

### For Ubuntu/Debian/CentOS/RHEL servers:

```bash
# Run the automated setup script
npm run setup
# or
./setup-server.sh
```

This script will:
- Install build tools (gcc, make, python3)
- Install Sharp/VIPS dependencies
- Install system fonts
- Rebuild Sharp for your platform
- Test the installation

### Manual Installation:

#### Ubuntu/Debian:
```bash
sudo apt update
sudo apt install -y build-essential libvips-dev libjpeg-dev libpng-dev libwebp-dev libgif-dev librsvg2-dev fonts-dejavu fonts-liberation
npm rebuild sharp
```

#### CentOS/RHEL/Fedora:
```bash
sudo yum groupinstall "Development Tools"
sudo yum install vips-devel libjpeg-devel libpng-devel libwebp-devel giflib-devel librsvg2-devel
npm rebuild sharp
```

## 🐳 Docker Deployment

### Build and run with Docker:

```bash
# Build the image
npm run docker:build

# Run with docker-compose (recommended)
npm run docker:compose

# Check logs
npm run docker:logs

# Stop
npm run docker:stop
```

### Or run directly:
```bash
docker build -t invoice-generator .
docker run -p 4000:4000 invoice-generator
```

## 🔧 Testing and Debugging

### Test Sharp installation:
```bash
npm run test:sharp
```

### Test dependencies:
```bash
npm run test:deps
```

### Debug endpoints (when server is running):

- **Health check**: `GET /health`
- **Sharp debug**: `GET /debug-sharp`
- **Default data**: `GET /api/default-data`

Example:
```bash
curl http://localhost:4000/debug-sharp
curl http://localhost:4000/health
```

## 🌐 Platform-Specific Instructions

### Vercel (Already configured):
Your `vercel.json` should handle Vercel deployment automatically.

### DigitalOcean/AWS/VPS:
1. Run `npm run setup` on your server
2. Use PM2 for production: `npm run pm2:start`
3. Set up nginx reverse proxy (optional)

### Heroku:
Add to your `package.json`:
```json
{
  "scripts": {
    "heroku-postbuild": "npm rebuild sharp"
  }
}
```

### Railway/Render:
These platforms should work out of the box with the current configuration.

## ❌ Common Issues and Solutions

### Issue: "Sharp not available" or "Cannot find module 'sharp'"
**Solution:**
```bash
npm install sharp
npm rebuild sharp
```

### Issue: "Error: Input buffer contains unsupported image format"
**Solution:** Install additional image format libraries:
```bash
# Ubuntu/Debian
sudo apt install libwebp-dev libgif-dev librsvg2-dev

# CentOS/RHEL
sudo yum install libwebp-devel giflib-devel librsvg2-devel
```

### Issue: "Error: VipsOperation: class 'text' not found"
**Solution:** Install libvips with text support:
```bash
# Ubuntu/Debian
sudo apt install libvips-dev librsvg2-dev

# CentOS/RHEL
sudo yum install vips-devel librsvg2-devel
```

### Issue: Font rendering problems
**Solution:** Install system fonts:
```bash
# Ubuntu/Debian
sudo apt install fonts-dejavu fonts-liberation fonts-noto

# CentOS/RHEL
sudo yum install dejavu-fonts liberation-fonts google-noto-fonts

# Update font cache
sudo fc-cache -fv
```

### Issue: Memory errors on low-memory servers
**Solution:** Adjust PM2 memory settings in `ecosystem.config.js`:
```javascript
max_memory_restart: '512M'  // Reduce from 1G
```

## 📊 Monitoring

### PM2 monitoring:
```bash
npm run pm2:status    # Check status
npm run pm2:logs      # View logs
npm run pm2:monitor   # Real-time monitoring
```

### Docker monitoring:
```bash
docker stats                    # Resource usage
docker logs invoice-generator   # Application logs
```

## 🔒 Production Checklist

- [ ] System dependencies installed
- [ ] Sharp rebuilt for target platform
- [ ] Environment variables configured
- [ ] PM2 or Docker running
- [ ] Logs directory exists and writable
- [ ] Template image (`frame.jpg`) present
- [ ] Port 4000 accessible
- [ ] Memory limits configured
- [ ] Auto-restart on reboot configured

## 🆘 Getting Help

If issues persist:

1. Run `npm run diagnose` and share the output
2. Check `/debug-sharp` endpoint response
3. Review application logs: `npm run pm2:logs`
4. Verify all system dependencies are installed

For platform-specific issues, refer to your hosting provider's documentation for Node.js applications with native dependencies.
