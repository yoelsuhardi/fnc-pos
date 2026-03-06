import { app, BrowserWindow, Menu, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';

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
ipcMain.on('silent-print', (event, options = {}) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (!win) return;

    const printerName = options.printerName || '';

    // We force the print dialog to SHOW because 'silent: true' breaks the layout on the target Windows Thermal Printer.
    // However, we will auto-press Enter using OS-level scripts so the user doesn't have to manually click 'Print'.
    win.webContents.print({
        silent: false, // Show the window explicitly!
        printBackground: true,
        deviceName: printerName
    }, (success, errorType) => {
        if (!success) console.error('[Auto-Enter Print] Failed:', errorType);
        else console.log('[Auto-Enter Print] Sent to printer successfully.');
    });

    // Fire OS-level keystroke to press 'Enter', confirming the system print dialog automatically.
    // 1000ms delay ensures the dialog has fully popped up and captured window focus.
    setTimeout(() => {
        if (process.platform === 'win32') {
            exec('powershell.exe -c "$wshell = New-Object -ComObject wscript.shell; $wshell.SendKeys(\'{ENTER}\')"', (err) => {
                if (err) console.error('Windows Auto-Enter failed:', err);
            });
        } else if (process.platform === 'darwin') {
            exec('osascript -e \'tell application "System Events" to key code 36\'', (err) => {
                if (err) console.error('Mac Auto-Enter failed:', err);
            });
        }
    }, 1000);
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
