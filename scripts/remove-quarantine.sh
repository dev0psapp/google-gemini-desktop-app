#!/bin/bash

# Remove quarantine attribute from macOS app to allow it to run without code signing
# This script removes the com.apple.quarantine extended attribute

APP_PATH="$1"

if [ -z "$APP_PATH" ]; then
    echo "Usage: $0 <path-to-app>"
    echo "Example: $0 dist/mac/Gemini.app"
    exit 1
fi

if [ ! -d "$APP_PATH" ]; then
    echo "Error: App not found at $APP_PATH"
    exit 1
fi

echo "Removing quarantine attribute from $APP_PATH..."
xattr -dr com.apple.quarantine "$APP_PATH"

# Also remove from all helper apps
find "$APP_PATH" -name "*.app" -exec xattr -dr com.apple.quarantine {} \;

echo "Done! You can now open the app."

