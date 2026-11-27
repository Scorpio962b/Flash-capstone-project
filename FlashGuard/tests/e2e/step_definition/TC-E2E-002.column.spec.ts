
import { test, expect } from '@playwright/test';
import { runQuery, closeDb } from '../support/db';

test('list columns', async () => {
  try {
    const rows = await runQuery(
      `SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE
       FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_NAME IN ('accounts','transactions','audit_log','ledger_entries')
       ORDER BY TABLE_NAME, ORDINAL_POSITION`,
    );

    expect(rows.length, 'Database schema should contain columns').toBeGreaterThan(0);

    const tableNames = new Set(rows.map((row) => row.TABLE_NAME));

    expect(tableNames.has('accounts')).toBe(true);
    expect(tableNames.has('transactions')).toBe(true);
    expect(tableNames.has('audit_log')).toBe(true);
    expect(tableNames.has('ledger_entries')).toBe(true);
  } finally {
    await closeDb();
  }
});
