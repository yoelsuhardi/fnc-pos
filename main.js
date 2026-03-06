import { app, BrowserWindow, Menu, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
ipcMain.on('silent-print', (event, printerName) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (!win) return;

    // Native Electron silent print (Works perfectly on Windows)
    win.webContents.print({
        silent: true,
        printBackground: true,
        deviceName: printerName // Use the printerName passed from the renderer
    }, (success, errorType) => {
        if (!success) console.error('[Silent Print] Failed:', errorType);
        else console.log('[Silent Print] Sent to printer successfully.');
    });
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
