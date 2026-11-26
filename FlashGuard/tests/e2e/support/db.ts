import 'dotenv/config';
import sql from 'mssql';

const config: sql.config = {
  server: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 1433),
  user: process.env.DB_USER ?? 'sa',
  password: process.env.DB_PASSWORD ?? 'YourPasswordHere',
  database: process.env.DB_NAME ?? 'FlashGuard',
  options: { trustServerCertificate: true, encrypt: false },
};

let pool: sql.ConnectionPool | undefined;

export async function runQuery(query: string, params: Record<string, any> = {}) {
  pool ??= await new sql.ConnectionPool(config).connect();
  const request = pool.request();
  for (const [name, value] of Object.entries(params)) {
    request.input(name, value);
  }
  const result = await request.query(query);
  return result.recordset;
}

export async function closeDb() {
  await pool?.close();
  pool = undefined;
}