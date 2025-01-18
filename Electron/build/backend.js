"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startBackend = startBackend;
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const electron_1 = require("electron");
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const path_1 = __importDefault(require("path"));
// Diretório de dados do usuário, que funciona tanto em desenvolvimento quanto em produção
const dbPath = path_1.default.join(electron_1.app.getPath('userData'), 'money_manager_v0.1.db');
const db = new better_sqlite3_1.default(dbPath);
// Criação das tabelas, caso ainda não existam
db.exec(`
    CREATE TABLE IF NOT EXISTS Rendas (
        id TEXT PRIMARY KEY,
        nome TEXT NOT NULL,
        valor REAL NOT NULL,
        is_recurring BOOLEAN NOT NULL DEFAULT 0,
        date_start DATE,
        date_end DATE
    );

    CREATE TABLE IF NOT EXISTS Economias (
        id TEXT PRIMARY KEY,
        nome TEXT NOT NULL,
        valor REAL NOT NULL,
        is_recurring BOOLEAN NOT NULL DEFAULT 0,
        date_start DATE,
        date_end DATE
    );

    CREATE TABLE IF NOT EXISTS Gastos (
        id TEXT PRIMARY KEY,
        nome TEXT NOT NULL,
        descricao TEXT,
        usar_saldo BOOLEAN NOT NULL DEFAULT 0,
        valor REAL NOT NULL,
        is_recurring BOOLEAN NOT NULL DEFAULT 0,
        date_start DATE,
        date_end DATE
    );

    CREATE TABLE IF NOT EXISTS Saldos (
        id TEXT PRIMARY KEY,
        nome TEXT NOT NULL,
        descricao TEXT,
        valor REAL NOT NULL
    );
`);
function startBackend(port) {
    const app = (0, express_1.default)();
    app.use((0, cors_1.default)());
    app.use(body_parser_1.default.json());
    app.use(body_parser_1.default.urlencoded({ extended: true }));
    app.get('/get_data', (req, res) => __awaiter(this, void 0, void 0, function* () {
        const table = req.query.table;
        console.log(`[/get_data] table recebida ${table}`);
        // Whitelist of allowed tables
        const allowedTables = ['Rendas', 'Gastos', 'Economias', 'Saldos'];
        if (!allowedTables.includes(table)) {
            return res.status(400).json({ error: 'Invalid table name' });
        }
        try {
            //await client.connect();
            const stmt = db.prepare(`SELECT * FROM ${table}`);
            const queryRes = stmt.all();
            res.json(queryRes);
        }
        catch (error) {
            console.error(`[get_data] Error querying table ${table}:`, error); // Detalhado no log do servidor
            res.status(500).json({ error: 'Failed to fetch data' }); // Genérico no cliente
        }
    }));
    app.post('/receive_data', (req, res) => __awaiter(this, void 0, void 0, function* () {
        console.log(`[/receive_data] Called ! req.body: `, req.body);
        try {
            const receivedData = req.body;
            const to_remove = receivedData.to_remove;
            if (!receivedData || (!receivedData.rendas && !receivedData.economias && !receivedData.gastos && !to_remove)) {
                throw new Error('[/receive_data] data is undefined or empty');
            }
            else {
                console.log(`[/receive_data] data is ok`);
            }
            console.log(`[/receive_data] items to be updated, receivedData: `, receivedData);
            // Converter is_recurring para 1 ou 0
            const convertIsRecurring = (item) => {
                if ('is_recurring' in item) {
                    item.is_recurring = item.is_recurring ? 1 : 0;
                }
                if ('usar_saldo' in item) {
                    item.usar_saldo = item.usar_saldo ? 1 : 0;
                }
            };
            // Aplicar a conversão em rendas, economias e gastos
            for (const item of receivedData.rendas)
                convertIsRecurring(item);
            for (const item of receivedData.economias)
                convertIsRecurring(item);
            for (const item of receivedData.gastos)
                convertIsRecurring(item);
            for (const item of receivedData.saldos)
                convertIsRecurring(item);
            db.exec('BEGIN TRANSACTION');
            // Caso tenha itens a remover, fazer primeiro
            if (to_remove) {
                for (const tr of to_remove) {
                    const stmt = db.prepare(`DELETE FROM ${tr.value} WHERE id = ?`);
                    stmt.run(tr.key);
                }
            }
            console.groupCollapsed('/receive_data Inserts');
            const insertEconomia = db.prepare(`INSERT INTO ECONOMIAS (id, nome, valor, is_recurring, date_start, date_end) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT (id) DO NOTHING;`);
            for (const item of receivedData.economias) {
                console.log(`[/receive_data] insertEconomia Query: INSERT INTO ECONOMIAS (id, nome, valor, is_recurring, date_start, date_end) VALUES (${item.id}, '${item.nome}', ${item.valor}, ${item.is_recurring}, '${item.date_start}', '${item.date_end}') ON CONFLICT (id) DO NOTHING;`);
                insertEconomia.run(item.id, item.nome, item.valor, item.is_recurring, item.date_start, item.date_end);
            }
            const insertRenda = db.prepare(`INSERT INTO RENDAS (id, nome, valor, is_recurring, date_start, date_end) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT (id) DO NOTHING;`);
            for (const item of receivedData.rendas) {
                console.log(`[/receive_data] insertRenda Query: INSERT INTO RENDAS (id, nome, valor, is_recurring, date_start, date_end) VALUES (${item.id}, '${item.nome}', ${item.valor}, ${item.is_recurring}, '${item.date_start}', '${item.date_end}') ON CONFLICT (id) DO NOTHING;`);
                insertRenda.run(item.id, item.nome, item.valor, item.is_recurring, item.date_start, item.date_end);
            }
            const insertGasto = db.prepare(`INSERT INTO GASTOS (id, nome, descricao, usar_saldo, valor, is_recurring, date_start, date_end) VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT (id) DO NOTHING;`);
            for (const item of receivedData.gastos) {
                console.log(`[/receive_data] insertGasto Query: INSERT INTO GASTOS (id, nome, descricao, usar_saldo, valor, is_recurring, date_start, date_end) VALUES (${item.id}, '${item.nome}', '${item.descricao}', ${item.usar_saldo}, ${item.valor}, ${item.is_recurring}, '${item.date_start}', '${item.date_end}') ON CONFLICT (id) DO NOTHING;`);
                insertGasto.run(item.id, item.nome, item.descricao, item.usar_saldo, item.valor, item.is_recurring, item.date_start, item.date_end);
            }
            const insertSaldo = db.prepare(`INSERT INTO SALDOS (id, nome, descricao, valor) VALUES (?, ?, ?, ?) ON CONFLICT (id) DO NOTHING;`);
            for (const item of receivedData.saldos) {
                console.log(`[/receive_data] insertSaldo Query: INSERT INTO SALDOS (id, nome, descricao, valor) VALUES (${item.id}, '${item.nome}', '${item.descricao}', ${item.valor}) ON CONFLICT (id) DO NOTHING;`);
                insertSaldo.run(item.id, item.nome, item.descricao, item.valor);
            }
            console.groupEnd();
            db.exec('COMMIT');
            res.status(200).json({ message: 'Dados recebidos e inseridos com sucesso' });
        }
        catch (error) {
            db.exec('ROLLBACK'); // Rollback on error
            console.error('Erro ao processar /receive_data:', error);
            res.status(400).json({ error: '[/receive_data] Erro ao receber / inserir dados ao banco' });
        }
    }));
    app.listen(port, () => {
        console.log('💵 Money Manager Ready 🔥');
    }).on('error', (err) => {
        console.error('Failed to start server:', err);
    });
}
