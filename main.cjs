const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

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
ipcMain.handle('get-printers', async (event) => {
    try {
        return await event.sender.getPrintersAsync();
    } catch (err) {
        console.error('Failed to get printers:', err);
        return [];
    }
});

ipcMain.handle('export-backup', async (event, jsonData) => {
    const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const { filePath, canceled } = await dialog.showSaveDialog({
        title: 'Export FNC POS Backup',
        defaultPath: `fnc-backup-${date}.json`,
        filters: [{ name: 'JSON Backup', extensions: ['json'] }]
    });
    if (canceled || !filePath) return { success: false };
    try {
        fs.writeFileSync(filePath, jsonData, 'utf-8');
        return { success: true, filePath };
    } catch (err) {
        console.error('Backup export failed:', err);
        return { success: false, error: err.message };
    }
});

// Called from KitchenDocket.jsx via ipcRenderer.send('silent-print')
ipcMain.on('silent-print', (event, payload) => {
    let isPreview = false;
    let printerName = '';

    if (typeof payload === 'object' && payload !== null) {
        isPreview = !!payload.isPreview;
        printerName = payload.printerName || '';
    } else {
        isPreview = !!payload;
    }

    const win = BrowserWindow.fromWebContents(event.sender);
    if (!win) return;

    const printOptions = {
        silent: !isPreview,  // Dialog shown only if isPreview is true
        printBackground: true, // Print background colors/styles
        margins: { marginType: 'none' } // Use thermal printer margins
    };

    if (!isPreview && printerName) {
        printOptions.deviceName = printerName;
    }

    win.webContents.print(
        printOptions,
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
