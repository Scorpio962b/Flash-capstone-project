
declare const require: (moduleName: string) => {
  execFileSync: (
    file: string,
    args: string[],
    options: {
      encoding: string;
      env: Record<string, string | undefined>;
      stdio: ['ignore', 'pipe', 'pipe'];
    },
  ) => string;
};

declare const process: {
  env: Record<string, string | undefined>;
};

const { execFileSync } = require('child_process');

export function executeSql(query: string): string {
  const useWindowsAuth = process.env.DB_AUTH?.toLowerCase() === 'windows';

  const args = [
    '-S',
    `${process.env.DB_HOST || 'localhost'},${process.env.DB_PORT || '1433'}`,
  ];

  if (useWindowsAuth) {
    args.push('-E');
  } else {
    const password = process.env.DB_PASSWORD;

    if (!password) {
      throw new Error(
        'Set DB_AUTH=windows or provide DB_PASSWORD to query SQL Server in E2E tests.',
      );
    }

    args.push('-U', process.env.DB_USER || 'fg', '-P', password);
  }

  args.push(
    '-d',
    process.env.DB_NAME || 'FlashGuard',
    '-C',
    '-b',
    '-h',
    '-1',
    '-W',
    '-s',
    '|',
    '-Q',
    query,
  );

  try {
    return execFileSync('sqlcmd', args, {
      encoding: 'utf8',
      env: process.env,
      stdio: ['ignore', 'pipe', 'pipe'],
    }).trim();
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);

    const stderr =
      typeof error === 'object' && error !== null && 'stderr' in error
        ? String(error.stderr || '')
        : '';

    throw new Error(`SQL Server query failed: ${stderr || message}`);
  }
}

export function getLatestLoginAuditId(accountId: number): number {
  const result = executeSql(`
    SET NOCOUNT ON;

    SELECT ISNULL(MAX(id), 0)
    FROM dbo.audit_log
    WHERE account_id = ${accountId}
      AND action = 'login';
  `);

  const id = Number(result);

  if (!Number.isInteger(id)) {
    throw new Error(`Unexpected SQL result: ${result}`);
  }

  return id;
}
