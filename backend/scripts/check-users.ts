import 'dotenv/config';
import { createConnection } from 'mysql2/promise';

async function bootstrap() {
  const host = process.env.MYSQL_HOST ?? 'localhost';
  const port = Number(process.env.MYSQL_PORT ?? 3306);
  const user = process.env.MYSQL_USER ?? 'root';
  const password = process.env.MYSQL_PASSWORD ?? '';
  const database = process.env.MYSQL_DATABASE ?? 'revenue';

  console.log(`Connecting to database ${database} on ${host}:${port}...`);
  const conn = await createConnection({
    host,
    port,
    user,
    password,
    database,
  });

  const [rows] = await conn.query('SELECT account_id, role_account, fullname, username, mail, status_account FROM account');
  console.log('Accounts in Database:');
  console.log(JSON.stringify(rows, null, 2));

  await conn.end();
}

bootstrap().catch((err) => {
  console.error('Error:', err);
});
