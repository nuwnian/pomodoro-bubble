const { app, BrowserWindow, ipcMain, screen } = require('electron');
const path = require('path');

let mainWindow;
let popupWindow = null;

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

// Create popup window for break reminder
function createPopupWindow() {
  if (popupWindow) {
    popupWindow.close();
  }
  
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  
  popupWindow = new BrowserWindow({
    width: 400,
    height: 200,
    x: (width - 400) / 2,
    y: (height - 200) / 2,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });
  
  popupWindow.loadFile('popup.html');
  popupWindow.show();
  
  // Auto-close after 5 seconds
  setTimeout(() => {
    if (popupWindow) {
      popupWindow.close();
      popupWindow = null;
    }
  }, 5000);
  
  popupWindow.on('closed', () => {
    popupWindow = null;
  });
}

// IPC handler for showing popup
ipcMain.on('show-break-popup', () => {
  createPopupWindow();
});

// Export for renderer process
module.exports = { mainWindow };