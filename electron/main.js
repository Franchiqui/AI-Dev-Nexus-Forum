const { app, BrowserWindow } = require('electron');
const path = require('path');
const http = require('http');

let mainWindow = null;
let nextServer = null;

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
// Puerto dev configurable por .env. Sin definir:
// - escritorio (ELECTRON_TARGET=desktop) → 3002
// - web (default) → 3000
const target = (process.env.ELECTRON_TARGET || '').toLowerCase();
const fallbackDevPort = target === 'desktop' ? '3002' : '3000';
const devPort = process.env.ELECTRON_DEV_PORT || fallbackDevPort;
const prodPort = '3000';

function waitForServer(port, maxAttempts) {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const check = () => {
      attempts++;
      const req = http.get(`http://localhost:${port}/`, (res) => { resolve(); });
      req.on('error', () => {
        if (attempts >= (maxAttempts || 60)) reject(new Error('Server did not start'));
        else setTimeout(check, 500);
      });
      req.setTimeout(2000, () => { req.destroy(); });
    };
    check();
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    icon: path.join(__dirname, '..', 'public', 'installer-icon.ico'),
  });

  if (isDev) {
    mainWindow.loadURL(`http://localhost:${devPort}`);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadURL(`http://localhost:${prodPort}`);
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function startNextServer() {
  return new Promise((resolve, reject) => {
    // En producción, los assets empaquetados están en app.asar, mientras que .next se
    // desempaqueta en app.asar.unpacked por asarUnpack. Usamos rutas distintas para módulo y build.
    const baseDir = isDev
      ? path.join(__dirname, '..')
      : path.join(process.resourcesPath, 'app');
    // node_modules y .next están en resources/app cuando asar está desactivado
    const nextModuleBase = isDev
      ? path.join(__dirname, '..')
      : path.join(process.resourcesPath, 'app');
    try {
      const next = require(path.join(nextModuleBase, 'node_modules', 'next'));
      const nextApp = next({ dev: false, dir: baseDir });
      const handle = nextApp.getRequestHandler();
      nextApp.prepare().then(() => {
        nextServer = http.createServer((req, res) => handle(req, res));
        nextServer.listen(prodPort, () => resolve());
      }).catch(reject);
    } catch (err) {
      reject(err);
    }
  });
}

app.whenReady().then(async () => {
  try {
    if (!isDev) {
      await startNextServer();
    } else {
      await waitForServer(parseInt(devPort), 30).catch(() => { });
    }
    createWindow();
  } catch (err) {
    console.error('Electron startup error:', err);
    app.quit();
  }
});

app.on('window-all-closed', () => {
  if (nextProcess) {
    nextProcess.kill();
  }
  if (nextServer) {
    nextServer.close();
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

