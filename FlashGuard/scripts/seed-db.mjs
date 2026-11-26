import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sql from "mssql";
import "dotenv/config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const file = path.resolve(__dirname, "../db/init/99-reset-and-seed.sql");
const batches = fs
  .readFileSync(file, "utf8")
  .split(/^\s*GO\s*$/gim)
  .map((b) => b.trim())
  .filter(Boolean);

const pool = await sql.connect({
  server: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 1433),
  database: process.env.DB_NAME || "FlashGuard",
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  options: { encrypt: false, trustServerCertificate: true },
});

for (const [i, batch] of batches.entries()) {
  const result = await pool.request().batch(batch);
  console.log(`batch ${i + 1}/${batches.length} ok`, result.rowsAffected);
}

const count = await pool.request().query("SELECT COUNT(*) AS n FROM dbo.accounts");
console.log("accounts:", count.recordset[0].n);
await pool.close();