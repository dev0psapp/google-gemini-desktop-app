# Google Gemini Desktop App

Cross-platform desktop application for Google Gemini AI - Windows, macOS, and Linux support with universal installers (x64 & ARM64)

## Features

- Cross-platform support (Windows, macOS, Linux)
- Universal installers (x64 and ARM64)
- Session persistence (saves login state)
- Native desktop experience
- Multiple installer formats per platform

## Installer Formats

### Windows
- **NSIS Installer** (.exe) - Full installer with x64 and ARM64 support

### macOS
- **DMG** - Disk image installer with x64 and ARM64 support

**Note**: Since the app is not code-signed, macOS Gatekeeper may block it. After opening the DMG and copying the app to Applications, you may need to remove the quarantine attribute:

```bash
xattr -dr com.apple.quarantine /Applications/Gemini.app
```

Or right-click the app and select "Open" instead of double-clicking, then confirm the security warning.

### Linux
- **DEB** - Debian/Ubuntu package (x64 and ARM64)

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm start

# Build for current platform
npm run build

# Build for specific platform (both x64 and ARM64)
npm run build:win
npm run build:mac
npm run build:linux

# Build for all platforms
npm run build:all
```

## Docker Build

```bash
docker build -t gemini-electron .
docker run -v $(pwd)/dist:/app/dist gemini-electron
```

## GitHub Actions

### Build Workflow
The workflow automatically builds for all platforms on push to main/master branch and creates artifacts:
- `win-installers` - Windows NSIS installers (.exe)
- `mac-installers` - macOS DMG files
- `linux-installers` - Linux DEB packages

All artifacts are available for 90 days and can be downloaded from the Actions tab.

### Release Workflow
When you create a git tag starting with `v` (e.g., `v1.0.0`), the release workflow:
1. Builds installers for all platforms
2. Creates a GitHub Release
3. Attaches all installer files to the release

To create a release:
```bash
git tag v1.0.0
git push origin v1.0.0
```

## Requirements

- Node.js 24.11.1
- npm

## Icons

Place your application icons in the `build/` directory:
- `icon.png` - Linux icon (512x512)
- `icon.ico` - Windows icon (256x256)
- `icon.icns` - macOS icon (512x512)

Icons are optional but recommended for production builds.

