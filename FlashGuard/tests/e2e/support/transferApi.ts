/** API client used by the E2E "web channel" and for database-side verification. */

const API_URL = (globalThis as typeof globalThis & { process?: { env?: { API_URL?: string } } }).process?.env?.API_URL ?? 'http://localhost:4000';
const EMAIL = (globalThis as typeof globalThis & { process?: { env?: { APP_EMAIL?: string } } }).process?.env?.APP_EMAIL ?? 'alice@flashguard.local';
const PASSWORD = (globalThis as typeof globalThis & { process?: { env?: { APP_PASSWORD?: string } } }).process?.env?.APP_PASSWORD ?? 'offline-demo';

export interface Session { token: string; userId: number; channel: string }
export interface Account { id: number; full_name?: string; email?: string }
export interface HistoryTx {
  id: number;
  amount: number | string;
  sender_account_id?: number | string;
  recipient_account_id?: number | string;
  status?: string;
  title?: string;
  created_at?: string;
}

export type ApiResponseBody = Record<string, unknown>;

export interface TransferResult {
  ok: boolean;
  httpStatus: number;
  body: ApiResponseBody;
  startedAt: number;
  finishedAt: number;
}

const isRecord = (value: unknown): value is ApiResponseBody =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const authHeaders = (token?: string) => ({
  'Content-Type': 'application/json',
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

async function call<T>(method: 'GET' | 'POST', path: string, token?: string, body?: unknown): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: authHeaders(token),
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const json: unknown = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message = isRecord(json) && typeof json.message === 'string'
      ? json.message
      : 'request failed';

    throw new Error(`${method} ${path} -> ${res.status}: ${message}`);
  }

  return json as T;
}

/** A separate login = a separate session, like opening the web app next to the phone. */
export async function loginAs(channel: 'web' | 'test-runner' = 'web'): Promise<Session> {
  const body = await call<{ token: string; user: { id: number } }>('POST', '/auth/login', undefined, {
    email: EMAIL,
    password: PASSWORD,
    deviceMetadata: { platform: channel, alias: channel === 'web' ? 'chrome-desktop' : 'test-runner' },
  });

  return { token: body.token, userId: body.user.id, channel };
}

export const getAccounts = (s: Session) => call<Account[]>('GET', '/accounts', s.token);

export async function getBalance(s: Session, accountId = s.userId): Promise<number> {
  const body = await call<{ balance: number | string }>('GET', `/accounts/${accountId}/balance`, s.token);
  return Number(body.balance);
}

export const getHistory = (s: Session) => call<HistoryTx[]>('GET', '/transactions/history', s.token);
export const getTransaction = (s: Session, id: number) => call<HistoryTx>('GET', `/transactions/${id}`, s.token);
export const authorize = (s: Session, id: number) =>
  call<unknown>('POST', `/transactions/transfer/${id}/authorize`, s.token);

/** Same payload the mobile app sends. Does NOT throw on failure, so the step can report both channels. */
export async function transfer(s: Session, recipientAccountId: number, amount: number): Promise<TransferResult> {
  const startedAt = Date.now();
  const res = await fetch(`${API_URL}/transactions/transfer`, {
    method: 'POST',
    headers: authHeaders(s.token),
    body: JSON.stringify({ senderAccountId: s.userId, recipientAccountId, amount }),
  });

  const responseBody: unknown = await res.json().catch(() => ({}));
  const body = isRecord(responseBody) ? responseBody : {};

  return { ok: res.ok, httpStatus: res.status, body, startedAt, finishedAt: Date.now() };
}