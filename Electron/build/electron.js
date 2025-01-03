"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const backend_1 = require("./backend");
// Para processar JSON do corpo das requisições
let mainWindow;
function createWindow() {
    mainWindow = new electron_1.BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true
        }
    });
    mainWindow.webContents.openDevTools(); // Abre as DevTools imediatamente
    console.log('Environment:', process.env.NODE_ENV);
    // Carregar o frontend do Vue (a partir da pasta dist)
    if (process.env.NODE_ENV === 'development') {
        console.log('process.env.NODE_ENV === development, loadURL(http://localhost:8080)');
        // Carregar o Vue a partir do servidor de desenvolvimento (localhost:8080 por padrão)
        mainWindow.loadURL('http://localhost:8080');
    }
    else {
        // Ajustar o caminho para acessar corretamente a pasta dist dentro do app.asar
        const indexPath = path_1.default.join(electron_1.app.getAppPath(), '..', '..', '..', 'index.html');
        console.log('Index Path:', indexPath); // Verifique o caminho no console
        // Verifique se o caminho existe e se o arquivo está lá
        mainWindow.loadURL(`file://${indexPath}`).catch((err) => {
            console.error("Erro ao carregar o arquivo:", err);
        });
    }
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}
electron_1.app.whenReady().then(() => {
    // Iniciar o backend antes de criar a janela
    (0, backend_1.startBackend)(45000); // Porta do backend
    createWindow();
    electron_1.app.on('activate', () => {
        if (electron_1.BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});
electron_1.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
