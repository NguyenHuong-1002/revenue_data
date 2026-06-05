const mysql = require('mysql2/promise');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

async function check() {
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST || 'localhost',
    port: Number(process.env.MYSQL_PORT || 3306),
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'revenue',
  });

  try {
    const tables = ['storeBranch', 'Plant', 'product', 'account', 'InventoryReport', 'saleReport'];
    console.log('--- DATABASE TABLE RECORD COUNTS ---');
    for (const t of tables) {
      const [rows] = await connection.query(`SELECT COUNT(*) as total FROM ${t}`);
      console.log(`${t}: ${rows[0].total} rows`);
    }
  } catch (err) {
    console.error('Error querying DB:', err);
  } finally {
    await connection.end();
  }
}

check();

