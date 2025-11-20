const { app, BrowserWindow, shell, protocol } = require('electron');
const path = require('path');

let mainWindow;

// Register custom protocol handler
function registerProtocol() {
  if (process.defaultApp) {
    if (process.argv.length >= 2) {
      app.setAsDefaultProtocolClient('google-gemini-desktop-app', process.execPath, [path.resolve(process.argv[1])]);
    }
  } else {
    app.setAsDefaultProtocolClient('google-gemini-desktop-app');
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
      partition: 'persist:gemini'
    },
    icon: path.join(__dirname, 'build', 'icon.png')
  });
  
  // Enable WebAuthn/Passkey support - allow all permissions for authentication
  mainWindow.webContents.session.setPermissionRequestHandler((webContents, permission, callback) => {
    // Allow all authentication-related permissions
    if (permission === 'webauthn' || 
        permission === 'webauthn-get-assertion' ||
        permission === 'webauthn-create') {
      callback(true);
    } else {
      callback(false);
    }
  });

  // Allow all navigation - let Google handle authentication in the Electron window
  // The persist:gemini partition will automatically save cookies and session data
  // Note: Passkey may show errors in development mode, but will work in built app

  // Load Gemini website
  mainWindow.loadURL('https://gemini.google.com/app');

  // Session persistence is automatic with persist: partition
  // Cookies, localStorage, and sessionStorage are automatically saved and restored

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Handle protocol URLs (deep links)
app.on('open-url', (event, url) => {
  event.preventDefault();
  if (url.startsWith('google-gemini-desktop-app://')) {
    // Handle callback from external browser
    if (mainWindow) {
      mainWindow.loadURL('https://gemini.google.com/app');
      mainWindow.focus();
    }
  }
});

app.whenReady().then(() => {
  registerProtocol();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Handle external links
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    event.preventDefault();
    require('electron').shell.openExternal(navigationUrl);
  });
});

