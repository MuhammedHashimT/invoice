#!/bin/bash
# Quick diagnosis script for Invoice Generator deployment issues

echo "🔍 Invoice Generator - Server Diagnosis"
echo "======================================="

# Check Node.js version
echo "📋 Node.js Information:"
echo "  Version: $(node --version)"
echo "  Platform: $(node -p 'process.platform')"
echo "  Architecture: $(node -p 'process.arch')"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found. Please run this script from your project directory."
    exit 1
fi

# Check project files
echo "📁 Project Files:"
echo "  package.json: $([ -f package.json ] && echo '✅ Found' || echo '❌ Missing')"
echo "  main.js: $([ -f main.js ] && echo '✅ Found' || echo '❌ Missing')"
echo "  frame.jpg: $([ -f frame.jpg ] && echo '✅ Found' || echo '❌ Missing')"
echo "  ecosystem.config.js: $([ -f ecosystem.config.js ] && echo '✅ Found' || echo '❌ Missing')"
echo ""

# Check dependencies
echo "📦 Dependencies:"
echo "  node_modules: $([ -d node_modules ] && echo '✅ Installed' || echo '❌ Missing - Run npm install')"

# Test Sharp
echo "🖼️  Sharp Status:"
node -e "
try {
    const sharp = require('sharp');
    console.log('  Sharp: ✅ Available');
    console.log('  Version:', sharp.versions.vips);
    console.log('  Platform:', sharp.versions.platform);
} catch (error) {
    console.log('  Sharp: ❌ Error -', error.message);
    console.log('  Solution: Run npm rebuild sharp or install system dependencies');
}
" 2>/dev/null || echo "  Sharp: ❌ Not available - Run npm install or setup-server.sh"

echo ""

# Check system dependencies
echo "🔧 System Dependencies:"
echo "  libvips: $(ldconfig -p | grep -q vips && echo '✅ Installed' || echo '❌ Missing')"
echo "  libjpeg: $(ldconfig -p | grep -q jpeg && echo '✅ Installed' || echo '❌ Missing')"
echo "  libpng: $(ldconfig -p | grep -q png && echo '✅ Installed' || echo '❌ Missing')"
echo ""

# Check PM2 status
echo "🚀 PM2 Status:"
if command -v pm2 &> /dev/null; then
    echo "  PM2: ✅ Installed"
    if pm2 list | grep -q "invoice-generator"; then
        echo "  App Status: $(pm2 list | grep invoice-generator | awk '{print $10}')"
    else
        echo "  App Status: ❌ Not running"
    fi
else
    echo "  PM2: ❌ Not installed - Run npm install -g pm2"
fi
echo ""

# Check ports
echo "🌐 Network:"
echo "  Port 4000: $(netstat -tulln 2>/dev/null | grep -q ':4000' && echo '🔴 In use' || echo '✅ Available')"
echo ""

# Memory and disk
echo "💾 Resources:"
echo "  Available Memory: $(free -h 2>/dev/null | awk '/^Mem:/ {print $7}' || echo 'Unknown')"
echo "  Disk Space: $(df -h . 2>/dev/null | awk 'NR==2 {print $4}' || echo 'Unknown')"
echo ""

# Quick fixes suggestions
echo "🛠️  Quick Fixes:"
if [ ! -d node_modules ]; then
    echo "  1. Install dependencies: npm install"
fi

if ! ldconfig -p 2>/dev/null | grep -q vips; then
    echo "  2. Install system dependencies: ./setup-server.sh"
fi

if ! command -v pm2 &> /dev/null; then
    echo "  3. Install PM2: npm install -g pm2"
fi

echo "  4. Test Sharp: node -e \"console.log(require('sharp').versions)\""
echo "  5. Start application: npm run pm2:start"
echo "  6. Check logs: npm run pm2:logs"
echo ""

echo "For detailed setup, run: ./setup-server.sh"
