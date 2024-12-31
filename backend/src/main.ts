/* RELATORIO:

    Forma de remover item adicionado
    Caso não exista nada inserido antes, ao tentar colocar um gasto e associar a uma economia ela não terá id.

*/

import { Client } from 'pg';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { Renda, Economia, Gasto, ReceivedData } from './classes'

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const client = new Client({
    user: 'local',
    host: '192.168.0.3',
    database: 'db',
    password: 'pass123',
    port: 5433
});

async function Pgtest(query: string): Promise<any> {
    try {
        await client.connect(); // Connect to the database
        const res = await client.query(query);
        console.log('res: ', res.rows);
        return res.rows
    } catch (err) {
        console.error('Error executing query', err);
    }
    // finally {
    //     console.log('[Pgtest] desconectando cliente (client.end())');
    //     await client.end();
    // }
}

Pgtest('SELECT * FROM Rendas');

app.get('/get_data', async (req, res) => {
    const table: string = req.query.table as string;
    console.log(`[/get_data] table recebida ${table}`);

    // Whitelist of allowed tables
    const allowedTables = ['Rendas', 'Gastos', 'Economias'];

    if (!allowedTables.includes(table)) {
        return res.status(400).json({ error: 'Invalid table name' });
    }
    
    try {
        //await client.connect();
        const queryRes = await client.query(`SELECT * FROM ${table}`);
        res.json(queryRes.rows);
    } catch (error) {
        console.error(`Error querying table ${table}:`, error);
        res.status(500).json({ error: 'An error occurred while fetching data' });
    } finally {
        //console.log('[/get_data] desconectando cliente (client.end())');
        //client.end();
    }
});

app.post('/receive_data', async (req, res) => {

    console.log(`[/receive_data] Called ! req.body: `, req.body);

    try {
    
        const receivedData: ReceivedData = req.body as ReceivedData;

        const rendas: Renda[] = receivedData.rendas;
        const economias: Economia[] = receivedData.economias;
        const gastos: Gasto[] = receivedData.gastos;

        if (!receivedData || (!receivedData.rendas && !receivedData.economias && !receivedData.gastos)) {
            throw new Error('[/receive_data] data is undefined or empty');
        } else {
            console.log(`[/receive_data] data is ok`);
        }

        console.log(`[/receive_data] itens a serem inseridos: receivedData: `, receivedData);
        
        await client.query('BEGIN');

        // inserir economias primeiro para já colocar o id

        const insertEconomia = 'INSERT INTO ECONOMIAS (id, nome, valor, is_recurring, date_start, date_end) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (id) DO NOTHING;';
        for (const item of receivedData.economias) {
            await client.query(insertEconomia, [item.id, item.nome, item.valor, item.is_recurring, item.date_start, item.date_end]);
        }

        const insertRenda = 'INSERT INTO RENDAS (id, nome, valor, is_recurring, date_start, date_end) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (id) DO NOTHING;';
        for (const item of receivedData.rendas) {
            await client.query(insertRenda, [item.id, item.nome, item.valor, item.is_recurring, item.date_start, item.date_end]);
        }

        const insertGasto = 'INSERT INTO GASTOS (id, nome, descricao, economia_id, valor, is_recurring, date_start, date_end) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (id) DO NOTHING;';
        for (const item of receivedData.gastos) {
            await client.query(insertGasto, [item.id, item.nome, item.descricao, item.economia_id, item.valor, item.is_recurring, item.date_start, item.date_end]);
        }

        await client.query('COMMIT');
    
        res.status(200).json({ message: 'Dados recebidos e inseridos com sucesso' });
        
    } catch (error) {
        await client.query('ROLLBACK');
        res.status(400).json({ error: '[/receive_data] Erro ao receber / inserir dados ao banco'});
    }
});

app.listen(45000, () => {
    console.log('💵 Money Manager Ready 🔥');
}).on('error', (err) => {
    console.error('Failed to start server:', err);
});