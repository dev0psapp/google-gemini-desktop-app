const { app, BrowserWindow, shell, protocol } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');

let mainWindow;

// Get path for storing app data
const userDataPath = app.getPath('userData');
const stateFile = path.join(userDataPath, 'window-state.json');

// Load saved window state
function loadWindowState() {
  try {
    if (fs.existsSync(stateFile)) {
      const data = fs.readFileSync(stateFile, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading window state:', error);
  }
  return null;
}

// Save window state
function saveWindowState() {
  if (!mainWindow) return;
  
  try {
    const bounds = mainWindow.getBounds();
    const state = {
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: bounds.height,
      isMaximized: mainWindow.isMaximized(),
      isFullScreen: mainWindow.isFullScreen()
    };
    fs.writeFileSync(stateFile, JSON.stringify(state, null, 2));
  } catch (error) {
    console.error('Error saving window state:', error);
  }
}

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
  // Don't create new window if one already exists
  if (mainWindow) {
    mainWindow.show();
    mainWindow.focus();
    return;
  }

  // Load saved window state
  const savedState = loadWindowState();
  
  // Default window options
  const defaultOptions = {
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    show: false, // Don't show until ready
    backgroundColor: '#ffffff',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
      partition: 'persist:gemini',
      backgroundThrottling: false, // Keep running in background
      cache: true // Enable caching
    },
    icon: path.join(__dirname, 'build', 'icon.png')
  };

  // Apply saved state if available
  if (savedState) {
    if (savedState.isMaximized) {
      defaultOptions.width = savedState.width || 1400;
      defaultOptions.height = savedState.height || 900;
    } else {
      defaultOptions.x = savedState.x;
      defaultOptions.y = savedState.y;
      defaultOptions.width = savedState.width || 1400;
      defaultOptions.height = savedState.height || 900;
    }
  }

  mainWindow = new BrowserWindow(defaultOptions);
  
  // Show window when ready to prevent white flash
  mainWindow.once('ready-to-show', () => {
    if (savedState && savedState.isMaximized) {
      mainWindow.maximize();
    }
    mainWindow.show();
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

  // Configure cache for faster loading
  mainWindow.webContents.session.webRequest.onBeforeRequest((details, callback) => {
    // Allow all requests
    callback({});
  });

  // Check if window already has content loaded (from previous session)
  const currentURL = mainWindow.webContents.getURL();
  if (!currentURL || currentURL === 'about:blank' || currentURL.includes('index.html')) {
    // Load local HTML first (loading screen) only if window is empty
    mainWindow.loadFile('index.html');

    // After a short delay, load the actual Gemini page
    // This allows the loading screen to show first
    setTimeout(() => {
      mainWindow.webContents.loadURL('https://gemini.google.com/app', {
        userAgent: mainWindow.webContents.getUserAgent()
      });
    }, 100);
  }
  // If window already has content, don't reload - preserve state

  // Handle navigation to preserve state
  mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
    // Allow navigation within Gemini domain
    if (navigationUrl.includes('gemini.google.com')) {
      return;
    }
    // Prevent navigation to external sites in the same window
    if (!navigationUrl.includes('gemini.google.com')) {
      event.preventDefault();
      shell.openExternal(navigationUrl);
    }
  });

  // Save window state on move/resize
  let saveStateTimeout;
  const debounceSaveState = () => {
    clearTimeout(saveStateTimeout);
    saveStateTimeout = setTimeout(() => {
      saveWindowState();
    }, 500);
  };

  mainWindow.on('move', debounceSaveState);
  mainWindow.on('resize', debounceSaveState);
  mainWindow.on('maximize', saveWindowState);
  mainWindow.on('unmaximize', saveWindowState);
  mainWindow.on('enter-full-screen', saveWindowState);
  mainWindow.on('leave-full-screen', saveWindowState);

  // Handle window close - on macOS, hide instead of closing
  mainWindow.on('close', (event) => {
    saveWindowState();
    
    // On macOS, hide the window instead of closing it
    // This preserves the window state and prevents reload
    if (process.platform === 'darwin') {
      event.preventDefault();
      mainWindow.hide();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle page load events - removed CSS injection that was causing white background
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
    // On macOS, show existing window instead of creating new one
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    } else {
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

