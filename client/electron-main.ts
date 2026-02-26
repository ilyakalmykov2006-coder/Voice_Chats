import { app, BrowserWindow, dialog, ipcMain, shell } from 'electron';
import path from 'node:path';
import fs from 'node:fs';

const isDev = !app.isPackaged;

function resolveConfigPath() {
  const localConfig = path.join(process.cwd(), 'config.json');
  if (fs.existsSync(localConfig)) return localConfig;

  const appDataConfig = path.join(app.getPath('appData'), 'VoiceChats', 'config.json');
  return appDataConfig;
}

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 700,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(() => {
  createWindow();

  ipcMain.handle('app:get-config-path', () => resolveConfigPath());
  ipcMain.handle('app:open-external', async (_event, url: string) => {
    await shell.openExternal(url);
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('second-instance', () => {
  dialog.showMessageBox({
    type: 'info',
    message: 'VoiceChats already running.'
  });
});
