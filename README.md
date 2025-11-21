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

## Contributing

Contributions are welcome! If you'd like to contribute to this project:

1. **Fork the repository** - Click the "Fork" button at the top of the page
2. **Create a feature branch** - Create a new branch for your changes
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes** - Write your code and test it thoroughly
4. **Commit your changes** - Write clear commit messages
   ```bash
   git commit -m "Add: your feature description"
   ```
5. **Push to your fork** - Push your changes to your forked repository
   ```bash
   git push origin feature/your-feature-name
   ```
6. **Create a Pull Request** - Open a pull request from your fork to the main repository

### Development Guidelines

- Follow the existing code style
- Add comments for complex logic
- Test your changes before submitting
- Update documentation if needed

## Forking

Feel free to fork this repository and customize it for your own needs! When forking:

1. **Update package.json** - Change the name, description, and author information
2. **Update app metadata** - Modify `main.js` and build configuration as needed
3. **Customize icons** - Replace icons in the `build/` directory with your own
4. **Update README** - Update this README with your project information

## Requirements

- Node.js 24.11.1
- npm

## Icons

Place your application icons in the `build/` directory:
- `icon.png` - Linux icon (512x512)
- `icon.ico` - Windows icon (256x256)
- `icon.icns` - macOS icon (512x512)

Icons are optional but recommended for production builds.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with [Electron](https://www.electronjs.org/)
- Uses [electron-builder](https://www.electron.build/) for packaging
- Integrates with [Google Gemini](https://gemini.google.com/)
