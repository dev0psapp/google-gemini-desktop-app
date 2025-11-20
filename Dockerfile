FROM node:24.11.1

WORKDIR /app

# Install system dependencies for electron-builder
RUN apt-get update && apt-get install -y \
    git \
    python3 \
    make \
    g++ \
    libnss3-dev \
    libatk-bridge2.0-dev \
    libdrm2 \
    libxkbcommon-dev \
    libxcomposite-dev \
    libxdamage-dev \
    libxrandr-dev \
    libgbm-dev \
    libxss1 \
    libasound2-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application files
COPY . .

# Build command (will be overridden in CI)
CMD ["npm", "run", "build:all"]

