import 'dotenv/config';
import { createConnection } from 'mysql2/promise';
import { randomBytes, scryptSync, timingSafeEqual } from 'crypto';

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return 'scrypt$' + salt + '$' + hash;
}

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

  const [rows] = await conn.query('SELECT account_id, username, password_hash, role_account FROM account WHERE username = "admin"') as any[];
  
  if (rows.length === 0) {
    console.log('No user "admin" found.');
  } else {
    const adminUser = rows[0];
    console.log('Found user admin:', adminUser.username);
    console.log('Stored hash:', adminUser.password_hash);
    console.log('Role:', adminUser.role_account);

    const isMatch = verifyPassword('Admin@123', adminUser.password_hash);
    console.log('Password "Admin@123" matches stored hash?', isMatch);

    if (!isMatch) {
      console.log('Updating admin password to Admin@123...');
      const newHash = hashPassword('Admin@123');
      await conn.query('UPDATE account SET password_hash = ? WHERE username = "admin"', [newHash]);
      console.log('Password updated successfully. New hash:', newHash);
    }
  }

  await conn.end();
}

bootstrap().catch(console.error);
