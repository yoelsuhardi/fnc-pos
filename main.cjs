const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');

const isDev = process.env.NODE_ENV === 'development';

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    // Remove default menu for production-like feel
    Menu.setApplicationMenu(null);

    if (isDev) {
        mainWindow.loadURL('http://localhost:5173');
        mainWindow.webContents.openDevTools();
    } else {
        mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'));
    }
}

// ─── Silent Print IPC handler ─────────────────────────────────────────────────
// Called from KitchenDocket.jsx via ipcRenderer.send('silent-print')
ipcMain.on('silent-print', (event, isPreview = false) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (!win) return;

    win.webContents.print(
        {
            silent: !isPreview,  // Dialog shown only if isPreview is true
            printBackground: true, // Print background colors/styles
            margins: { marginType: 'none' } // Use thermal printer margins
        },
        (success, errorType) => {
            if (!success) {
                console.error('[Silent Print] Failed:', errorType);
            } else {
                console.log('[Silent Print] Sent to printer successfully.');
            }
        }
    );
});
// ─────────────────────────────────────────────────────────────────────────────

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
