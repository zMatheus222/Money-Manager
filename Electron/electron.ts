import { app, BrowserWindow } from 'electron';
import path from 'path';
import { startBackend } from './backend';

// Para processar JSON do corpo das requisições

let mainWindow: BrowserWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  });

  mainWindow.webContents.openDevTools();  // Abre as DevTools imediatamente

  console.log('Environment:', process.env.NODE_ENV);
  
  // Carregar o frontend do Vue (a partir da pasta dist)
  if (process.env.NODE_ENV === 'development') {
    console.log('process.env.NODE_ENV === development, loadURL(http://localhost:8080)');
    // Carregar o Vue a partir do servidor de desenvolvimento (localhost:8080 por padrão)
    mainWindow.loadURL('http://localhost:8080');
  } else {
    // Ajustar o caminho para acessar corretamente a pasta dist dentro do app.asar
    const indexPath = path.join(app.getAppPath(), '..', '..', '..', 'index.html');
    console.log('Index Path:', indexPath);  // Verifique o caminho no console

    // Verifique se o caminho existe e se o arquivo está lá
    mainWindow.loadURL(`file://${indexPath}`).catch((err) => {
      console.error("Erro ao carregar o arquivo:", err);
    });
  }

  mainWindow.on('closed', () => {
    mainWindow = null!;
  });
}

app.whenReady().then(() => {

  // Iniciar o backend antes de criar a janela
  startBackend(45000); // Porta do backend

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
