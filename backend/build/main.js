"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Pgtest = Pgtest;
const pg_1 = require("pg");
const client = new pg_1.Client({
    user: 'local',
    host: '192.168.0.3',
    database: 'db',
    password: 'pass123',
    port: 5433
});
async function Pgtest() {
    try {
        await client.connect(); // Connect to the database
        const res = await client.query('SELECT * FROM Rendas');
        console.log('res: ', res.rows);
    }
    catch (err) {
        console.error('Error executing query', err);
    }
    finally {
        await client.end(); // Close the client connection
    }
}
Pgtest();
