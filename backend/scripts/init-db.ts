import 'dotenv/config';
import { createConnection } from 'mysql2/promise';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

async function bootstrap() {
  const sqlPath = resolve(__dirname, '../../database/init.sql');
  const sql = readFileSync(sqlPath, 'utf-8');

  const host = process.env.MYSQL_HOST ?? 'localhost';
  const port = Number(process.env.MYSQL_PORT ?? 3306);
  const user = process.env.MYSQL_USER ?? 'root';
  const password = process.env.MYSQL_PASSWORD ?? '';

  console.log(`Connecting to MySQL at ${host}:${port}...`);

  const conn = await createConnection({
    host,
    port,
    user,
    password,
    multipleStatements: true,
  });
  console.log('Connected. Executing database/init.sql...');

  await conn.query(sql);

  await conn.end();
  console.log('Database initialized successfully!');
}

bootstrap().catch((err) => {
  console.error('Failed to initialize database:', err.message);
  process.exit(1);
});
