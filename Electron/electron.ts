import { app, BrowserWindow } from 'electron';
import path from 'path';
import { startBackend } from '../backend/src/backend';

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

  // Carregar o frontend do Vue (a partir da pasta dist)
  if (process.env.NODE_ENV === 'development') {
    // Carregar o Vue a partir do servidor de desenvolvimento (localhost:8080 por padrão)
      mainWindow.loadURL('http://localhost:8080');
  } else {
      // Caso contrário, carregue o arquivo gerado pelo Vue (modo de produção)
      console.log('dir:: ', __dirname + '\\..\\..\\dist\\index.html');
      mainWindow.loadFile(path.join(__dirname, '..', '..', 'dist', 'index.html'));
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
