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
    const [rows] = await connection.query('SELECT COUNT(*) as total, MIN(calendar_year_week) as min_date, MAX(calendar_year_week) as max_date FROM InventoryReport');
    console.log('--- INVENTORY REPORT TABLE STATS ---');
    console.log(JSON.stringify(rows[0], null, 2));

    const [sample] = await connection.query('SELECT * FROM InventoryReport LIMIT 3');
    console.log('--- SAMPLE ROWS ---');
    console.log(JSON.stringify(sample, null, 2));
  } catch (err) {
    console.error('Error querying DB:', err);
  } finally {
    await connection.end();
  }
}

check();
