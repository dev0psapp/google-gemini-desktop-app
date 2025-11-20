#!/bin/bash

# Script to generate all icon formats from webp source
# Usage: ./scripts/generate-icons.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
SOURCE_ICON="$PROJECT_DIR/icon/gemini-app-icon.webp"
BUILD_DIR="$PROJECT_DIR/build"

# Check if source icon exists
if [ ! -f "$SOURCE_ICON" ]; then
    echo "Error: Source icon not found at $SOURCE_ICON"
    exit 1
fi

# Check for required tools
if ! command -v magick &> /dev/null && ! command -v convert &> /dev/null; then
    echo "Error: ImageMagick not found. Please install it: brew install imagemagick"
    exit 1
fi

if ! command -v sips &> /dev/null; then
    echo "Error: sips not found (macOS built-in tool)"
    exit 1
fi

if ! command -v iconutil &> /dev/null; then
    echo "Error: iconutil not found (macOS built-in tool)"
    exit 1
fi

echo "Generating icons from $SOURCE_ICON..."

# Use magick if available, otherwise convert
if command -v magick &> /dev/null; then
    IMAGEMAGICK="magick"
else
    IMAGEMAGICK="convert"
fi

# Generate PNG for Linux (512x512)
echo "  - Generating icon.png (Linux)..."
$IMAGEMAGICK "$SOURCE_ICON" -resize 512x512 "$BUILD_DIR/icon.png"

# Generate ICO for Windows (multiple sizes)
echo "  - Generating icon.ico (Windows)..."
$IMAGEMAGICK "$SOURCE_ICON" \
    \( -clone 0 -resize 16x16 \) \
    \( -clone 0 -resize 32x32 \) \
    \( -clone 0 -resize 48x48 \) \
    \( -clone 0 -resize 256x256 \) \
    -delete 0 \
    -alpha on \
    "$BUILD_DIR/icon.ico"

# Generate ICNS for macOS
echo "  - Generating icon.icns (macOS)..."
ICONSET_DIR="$BUILD_DIR/icon.iconset"
rm -rf "$ICONSET_DIR"
mkdir -p "$ICONSET_DIR"

# Create all required sizes for macOS
$IMAGEMAGICK "$SOURCE_ICON" -resize 512x512 "$ICONSET_DIR/icon_512x512.png"
sips -z 16 16 "$ICONSET_DIR/icon_512x512.png" --out "$ICONSET_DIR/icon_16x16.png" > /dev/null
sips -z 32 32 "$ICONSET_DIR/icon_512x512.png" --out "$ICONSET_DIR/icon_16x16@2x.png" > /dev/null
sips -z 32 32 "$ICONSET_DIR/icon_512x512.png" --out "$ICONSET_DIR/icon_32x32.png" > /dev/null
sips -z 64 64 "$ICONSET_DIR/icon_512x512.png" --out "$ICONSET_DIR/icon_32x32@2x.png" > /dev/null
sips -z 128 128 "$ICONSET_DIR/icon_512x512.png" --out "$ICONSET_DIR/icon_128x128.png" > /dev/null
sips -z 256 256 "$ICONSET_DIR/icon_512x512.png" --out "$ICONSET_DIR/icon_128x128@2x.png" > /dev/null
sips -z 256 256 "$ICONSET_DIR/icon_512x512.png" --out "$ICONSET_DIR/icon_256x256.png" > /dev/null
sips -z 512 512 "$ICONSET_DIR/icon_512x512.png" --out "$ICONSET_DIR/icon_256x256@2x.png" > /dev/null

# Convert iconset to icns
iconutil -c icns "$ICONSET_DIR" -o "$BUILD_DIR/icon.icns"
rm -rf "$ICONSET_DIR"

echo ""
echo "✓ Icons generated successfully:"
echo "  - build/icon.png (Linux)"
echo "  - build/icon.ico (Windows)"
echo "  - build/icon.icns (macOS)"

