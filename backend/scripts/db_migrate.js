const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function main() {
  let conn;
  try {
    conn = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '',
      database: 'revenue'
    });
    console.log('Connected to MySQL successfully!');

    // Check and add column logic
    const checkAndAddColumn = async (columnName, ddl) => {
      const [columns] = await conn.query(
        `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'storeBranch' AND COLUMN_NAME = ?`,
        [columnName]
      );
      if (columns.length === 0) {
        await conn.query(ddl);
        console.log(`Added column ${columnName} to storeBranch table.`);
      } else {
        console.log(`Column ${columnName} already exists.`);
      }
    };

    await checkAndAddColumn('latitude', 'ALTER TABLE storeBranch ADD COLUMN latitude DOUBLE DEFAULT NULL');
    await checkAndAddColumn('longitude', 'ALTER TABLE storeBranch ADD COLUMN longitude DOUBLE DEFAULT NULL');

    // Read storebranch.init.json and update values
    const jsonPath = path.resolve(__dirname, '../src/data/storebranch.init.json');
    const storesJson = fs.readFileSync(jsonPath, 'utf8');
    const stores = JSON.parse(storesJson);

    let updated = 0;
    for (const st of stores) {
      await conn.query(
        'UPDATE storeBranch SET latitude = ?, longitude = ? WHERE store_id = ?',
        [st.latitude, st.longitude, st.store_id]
      );
      updated++;
    }
    console.log(`Updated ${updated} branches with detailed coordinates in the database!`);
  } catch (err) {
    console.error('Error during DDL migration:', err.stack || err.message);
  } finally {
    if (conn) await conn.end();
  }
}

main();
