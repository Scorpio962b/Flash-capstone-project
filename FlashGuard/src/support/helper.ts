
/** Shared helpers: ZAR parsing, backend "oracle" and per-scenario context. */

const API_URL = process.env.API_URL ?? 'http://localhost:4000'; // test runner runs on the host, not the emulator
const EMAIL = process.env.APP_EMAIL ?? 'alice@flashguard.local';
const PASSWORD = process.env.APP_PASSWORD ?? 'offline-demo';

export interface BackendTransaction {
  id: number;
  amount: number | string;
  status?: string;
  title?: string;
}

export interface BackendState {
  userId: number;
  fullName: string;
  balance: number;
  history: BackendTransaction[];
}

async function call<T>(
  path: string,
  opts: { token?: string; body?: unknown } = {},
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: opts.body ? 'POST' : 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(opts.token ? { Authorization: `Bearer ${opts.token}` } : {}),
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });

  const json = (await res.json()) as { message?: string };

  if (!res.ok) {
    throw new Error(`${path} -> ${res.status}: ${json?.message ?? 'request failed'}`);
  }

  return json as T;
}

/** Logs in through the API and returns what the app should be showing. */
export async function getBackendState(): Promise<BackendState> {
  const login = await call<{
    token: string;
    user: { id: number; full_name: string };
  }>('/auth/login', {
    body: {
      email: EMAIL,
      password: PASSWORD,
      deviceMetadata: { platform: 'test-runner', alias: 'localhost' },
    },
  });

  const [bal, history] = await Promise.all([
    call<{ balance: number }>(`/accounts/${login.user.id}/balance`, {
      token: login.token,
    }),
    call<BackendTransaction[]>('/transactions/history', {
      token: login.token,
    }),
  ]);

  return {
    userId: login.user.id,
    fullName: login.user.full_name,
    balance: Number(bal.balance),
    history,
  };
}

/**
 * Parses "R 125 430,50", "R 1,240.50", "-R 1 240,50", "R 0.00" ... into a number.
 * The app uses Intl en-ZA, so separators/NBSP vary by device: be tolerant.
 */
export function parseZar(raw: string): number {
  const negative = raw.includes('-') || raw.includes('−');
  const cleaned = raw.replace(/[^\d,.]/g, '');
  const m = cleaned.match(/^(.*)[.,](\d{2})$/);
  const value = m
    ? Number(`${(m[1] ?? '').replace(/[.,]/g, '')}.${m[2] ?? '00'}`)
    : Number(cleaned.replace(/[.,]/g, ''));

  return negative ? -value : value;
}

/** Mirrors normalizeTransactionStatus() in App.js. */
export const normaliseStatus = (s?: string): string =>
  String(s ?? '').trim().toLowerCase();

/** Mirrors `item.title || \`Transfer #${item.id}\`` in HistoryScreen. */
export const expectedTitle = (tx: BackendTransaction): string =>
  tx.title || `Transfer #${tx.id}`;

export const round2 = (n: number): number => Math.round(n * 100) / 100;

// ---- per-scenario state (reset in hooks.ts) ----
export const ctx: { backend?: BackendState } = {};

export function resetCtx(): void {
  delete ctx.backend;
}

export function backend(): BackendState {
  if (!ctx.backend) {
    throw new Error('Backend state not loaded: is the login step missing?');
  }

  return ctx.backend;
}

export const firstTitle = (): string => {
  const tx = backend().history[0];

  if (!tx) {
    throw new Error('No first transaction found');
  }

  return expectedTitle(tx);
};

export const lastTitle = (): string => {
  const history = backend().history;
  const tx = history[history.length - 1];

  if (!tx) {
    throw new Error('No last transaction found');
  }

  return expectedTitle(tx);
};
