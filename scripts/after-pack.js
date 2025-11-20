const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Remove quarantine attribute from macOS app to allow it to run without code signing
function removeQuarantine(appPath) {
  if (process.platform !== 'darwin') {
    return;
  }

  if (!fs.existsSync(appPath)) {
    console.log(`App not found at ${appPath}, skipping quarantine removal`);
    return;
  }

  try {
    console.log(`Removing quarantine attribute from ${appPath}...`);
    execSync(`xattr -dr com.apple.quarantine "${appPath}"`, { stdio: 'inherit' });
    
    // Also remove from all helper apps
    const helpersPath = path.join(appPath, 'Contents', 'Frameworks');
    if (fs.existsSync(helpersPath)) {
      execSync(`find "${helpersPath}" -name "*.app" -exec xattr -dr com.apple.quarantine {} \\;`, { stdio: 'inherit' });
    }
    
    console.log('Quarantine attribute removed successfully!');
  } catch (error) {
    console.warn('Warning: Could not remove quarantine attribute:', error.message);
  }
}

// This hook is called after the app is packed but before signing
// It receives the appOutDir and platform
module.exports = async function(context) {
  const { appOutDir, platformName } = context;
  
  if (platformName === 'darwin' || platformName === 'mac') {
    const appName = context.packager.appInfo.productFilename;
    const appPath = path.join(appOutDir, `${appName}.app`);
    removeQuarantine(appPath);
  }
};

