#!/bin/bash
# Server Setup Script for Invoice Generator
# This script installs all necessary dependencies for Sharp image processing

echo "🚀 Setting up server for Invoice Generator..."
echo "================================================="

# Function to detect OS
detect_os() {
    if [ -f /etc/debian_version ]; then
        echo "debian"
    elif [ -f /etc/redhat-release ]; then
        echo "redhat"
    elif [ -f /etc/alpine-release ]; then
        echo "alpine"
    else
        echo "unknown"
    fi
}

OS=$(detect_os)
echo "📋 Detected OS: $OS"

# Update package manager
echo "📦 Updating package manager..."
case $OS in
    "debian")
        sudo apt update
        ;;
    "redhat")
        if command -v dnf &> /dev/null; then
            sudo dnf update -y
        else
            sudo yum update -y
        fi
        ;;
    "alpine")
        sudo apk update
        ;;
    *)
        echo "⚠️  Unknown OS. Please install dependencies manually."
        exit 1
        ;;
esac

# Install build tools
echo "🔧 Installing build tools..."
case $OS in
    "debian")
        sudo apt install -y build-essential python3 make g++
        ;;
    "redhat")
        if command -v dnf &> /dev/null; then
            sudo dnf groupinstall -y "Development Tools"
            sudo dnf install -y python3 make gcc-c++
        else
            sudo yum groupinstall -y "Development Tools"
            sudo yum install -y python3 make gcc-c++
        fi
        ;;
    "alpine")
        sudo apk add --no-cache build-base python3 make g++
        ;;
esac

# Install Sharp/VIPS dependencies
echo "🖼️  Installing image processing libraries..."
case $OS in
    "debian")
        sudo apt install -y \
            libvips-dev \
            libjpeg-dev \
            libpng-dev \
            libwebp-dev \
            libgif-dev \
            librsvg2-dev \
            libtiff-dev
        ;;
    "redhat")
        if command -v dnf &> /dev/null; then
            sudo dnf install -y \
                vips-devel \
                libjpeg-devel \
                libpng-devel \
                libwebp-devel \
                giflib-devel \
                librsvg2-devel \
                libtiff-devel
        else
            sudo yum install -y \
                vips-devel \
                libjpeg-devel \
                libpng-devel \
                libwebp-devel \
                giflib-devel \
                librsvg2-devel \
                libtiff-devel
        fi
        ;;
    "alpine")
        sudo apk add --no-cache \
            vips-dev \
            jpeg-dev \
            png-dev \
            webp-dev \
            gif-dev \
            librsvg-dev \
            tiff-dev
        ;;
esac

# Install fonts
echo "🔤 Installing fonts..."
case $OS in
    "debian")
        sudo apt install -y \
            fonts-dejavu \
            fonts-liberation \
            fonts-noto \
            fontconfig
        ;;
    "redhat")
        if command -v dnf &> /dev/null; then
            sudo dnf install -y \
                dejavu-fonts \
                liberation-fonts \
                google-noto-fonts \
                fontconfig
        else
            sudo yum install -y \
                dejavu-fonts \
                liberation-fonts \
                google-noto-fonts \
                fontconfig
        fi
        ;;
    "alpine")
        sudo apk add --no-cache \
            font-dejavu \
            font-liberation \
            font-noto \
            fontconfig
        ;;
esac

# Check if we're in the project directory
if [ ! -f "package.json" ]; then
    echo "⚠️  package.json not found. Please run this script from your project directory."
    exit 1
fi

# Install Node.js dependencies
echo "📚 Installing Node.js dependencies..."
if command -v pnpm &> /dev/null; then
    echo "Using pnpm..."
    pnpm install
elif command -v yarn &> /dev/null; then
    echo "Using yarn..."
    yarn install
else
    echo "Using npm..."
    npm install
fi

# Rebuild Sharp with proper binaries
echo "🔄 Rebuilding Sharp for current platform..."
npm rebuild sharp

# Update font cache
echo "🔄 Updating font cache..."
sudo fc-cache -fv

# Test Sharp installation
echo "🧪 Testing Sharp installation..."
node -e "
const sharp = require('sharp');
console.log('✅ Sharp version:', sharp.versions);
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
    console.log('✅ Sharp test successful! Generated', buffer.length, 'bytes');
})
.catch(error => {
    console.error('❌ Sharp test failed:', error.message);
    process.exit(1);
});
"

echo ""
echo "🎉 Setup completed successfully!"
echo "================================================="
echo "Your server is now ready to run the Invoice Generator."
echo ""
echo "Next steps:"
echo "1. Start your application: npm run pm2:start"
echo "2. Check status: npm run pm2:status"
echo "3. Test the debug endpoint: curl http://localhost:4000/debug-sharp"
echo ""
echo "If you encounter issues, check the logs: npm run pm2:logs"
