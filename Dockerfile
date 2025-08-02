# Dockerfile for Invoice Generator
FROM node:18-alpine

# Install system dependencies for Sharp
RUN apk add --no-cache \
    vips-dev \
    build-base \
    python3 \
    make \
    g++ \
    jpeg-dev \
    png-dev \
    webp-dev \
    gif-dev \
    librsvg-dev \
    tiff-dev \
    font-dejavu \
    font-liberation \
    font-noto \
    fontconfig

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml* ./

# Install dependencies
RUN npm install

# Copy application files
COPY . .

# Create logs directory
RUN mkdir -p logs

# Update font cache
RUN fc-cache -fv

# Rebuild Sharp for Alpine Linux
RUN npm rebuild sharp

# Expose port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:4000/health', (res) => { \
        process.exit(res.statusCode === 200 ? 0 : 1) \
    }).on('error', () => process.exit(1))"

# Start application
CMD ["npm", "start"]
