import 'dotenv/config';
import { createConnection } from 'mysql2/promise';
import { scryptSync, timingSafeEqual } from 'crypto';

function verifyPassword(password: string, passwordHash: string): boolean {
  const [algorithm, salt, storedHash] = passwordHash.split('$');

  if (algorithm !== 'scrypt' || !salt || !storedHash) {
    return password === passwordHash;
  }

  const suppliedHash = scryptSync(password, salt, 64);
  const storedHashBuffer = Buffer.from(storedHash, 'hex');

  return (
    suppliedHash.length === storedHashBuffer.length &&
    timingSafeEqual(suppliedHash, storedHashBuffer)
  );
}

async function bootstrap() {
  const host = process.env.MYSQL_HOST ?? 'localhost';
  const port = Number(process.env.MYSQL_PORT ?? 3306);
  const user = process.env.MYSQL_USER ?? 'root';
  const password = process.env.MYSQL_PASSWORD ?? '';
  const database = process.env.MYSQL_DATABASE ?? 'revenue';

  const conn = await createConnection({
    host,
    port,
    user,
    password,
    database,
  });

  const [rows] = await conn.query('SELECT password_hash FROM account WHERE username = "trunglv"') as any[];
  if (rows.length > 0) {
    const hash = rows[0].password_hash;
    const testList = ['Admin@123', 'Matkhau@123', '123456', 'trunglv', 'admin'];
    for (const test of testList) {
      if (verifyPassword(test, hash)) {
        console.log(`Password of trunglv matches: "${test}"`);
        break;
      }
    }
  } else {
    console.log('User trunglv not found');
  }

  await conn.end();
}

bootstrap().catch(console.error);
