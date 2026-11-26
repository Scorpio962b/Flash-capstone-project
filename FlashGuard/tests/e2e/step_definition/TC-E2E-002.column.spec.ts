import { test } from '@playwright/test';
import { runQuery, closeDb } from '../support/db';

test('list columns', async () => {
  const rows = await runQuery(
    `SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE
     FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_NAME IN ('accounts','transactions','audit_log','ledger_entries')
     ORDER BY TABLE_NAME, ORDINAL_POSITION`);
  console.table(rows);
  await closeDb();
});