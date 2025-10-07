const { app, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 250,
    height: 250,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    skipTaskbar: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    icon: path.join(__dirname, 'assets', 'icon.png') // Optional icon
  });

  mainWindow.loadFile('index.html');
  
  // Make window draggable
  mainWindow.setIgnoreMouseEvents(false);
  
  // Remove menu bar
  mainWindow.setMenuBarVisibility(false);
  
  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
  
  // Keep window always on top
  mainWindow.setAlwaysOnTop(true, 'floating', 1);
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Export for renderer process
module.exports = { mainWindow };