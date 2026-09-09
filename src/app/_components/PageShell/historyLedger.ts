/**
 * A Tapis service change ledger's vocabulary, as pure functions — what an
 * operation means and how it should read, what the service's
 * `description` field actually holds, and how a run of entries breaks
 * into days.
 *
 * Shared across services on purpose. Systems.SystemHistory and
 * Apps.AppHistory are the same record (Apps adds `appVersion`), and the
 * jobs ledger is the same shape again — so the entry type below is
 * structural rather than imported from one service, and every service's
 * history satisfies it without a cast.
 *
 * Pure on purpose: the box and the expanded dialog both render from
 * these, and the correctness (a patch that does not parse, a day
 * boundary, an operation the service adds next release) lives here where
 * it can be tested without a browser.
 */

export type HistoryEntry = {
  jwtTenant?: string;
  jwtUser?: string;
  oboTenant?: string;
  oboUser?: string;
  operation?: string;
  /** the spec says string; the live services send an object — see
   *  parseDescription, which takes either */
  description?: unknown;
  created?: string;
  /** apps only: which version of the app the operation touched */
  appVersion?: string;
};

/** what a family of operations did, and the colour it reads in */
export type OpTone = {
  color: string;
  /** the wash behind the operation chip in the expanded view */
  bg: string;
  /** the plain-language family, for grouping and for the legend */
  family: 'lifecycle' | 'definition' | 'access' | 'credentials' | 'read';
};

const TONES: Record<OpTone['family'], Omit<OpTone, 'family'>> = {
  lifecycle: { color: '#1b7f3b', bg: 'rgba(27,127,59,0.10)' },
  definition: { color: '#5f4bb5', bg: 'rgba(95,75,181,0.10)' },
  access: { color: '#9a5b00', bg: 'rgba(154,91,0,0.10)' },
  credentials: { color: '#1565c0', bg: 'rgba(21,101,192,0.10)' },
  read: { color: '#6b6b6b', bg: 'rgba(0,0,0,0.05)' },
};

const FAMILY_BY_OP: Record<string, OpTone['family']> = {
  CREATE: 'lifecycle',
  UNDELETE: 'lifecycle',
  ENABLE: 'lifecycle',
  DELETE: 'lifecycle',
  DISABLE: 'lifecycle',
  MODIFY: 'definition',
  CHANGE_OWNER: 'definition',
  GET_PERMS: 'access',
  REVOKE_PERMS: 'access',
  SET_CRED: 'credentials',
  REMOVE_CRED: 'credentials',
  GET_CRED: 'credentials',
  READ: 'read',
  EXECUTE: 'read',
};

/** the operations that END something — red inside their own family */
const DESTRUCTIVE = new Set([
  'DELETE',
  'DISABLE',
  'REVOKE_PERMS',
  'REMOVE_CRED',
]);

export const opTone = (op?: string): OpTone => {
  const key = (op ?? '').toUpperCase();
  const family = FAMILY_BY_OP[key] ?? 'definition';
  if (DESTRUCTIVE.has(key)) {
    return { color: '#c62828', bg: 'rgba(198,40,40,0.10)', family };
  }
  return { ...TONES[family], family };
};

/** CHANGE_OWNER → "change owner"; unknown operations pass through lowered */
export const opLabel = (op?: string): string =>
  (op ?? 'unknown').toLowerCase().replace(/_/g, ' ');

/**
 * The ledger's `description`. For most operations the service writes the
 * JSON it applied — a patch, an owner, a permission set — and for some it
 * writes prose. Parse when it parses, and say which it was: the expanded
 * view renders fields as rows and prose as a sentence.
 *
 * Takes `unknown`, not `string`, because the spec is wrong about this
 * one: SystemHistory.description is declared a string, and the live
 * service hands back an already-parsed OBJECT. Calling .trim() on it
 * threw and took the dialog down with it. So: accept either, and treat
 * the object case as the field set it already is.
 */
export type ParsedDescription =
  | { kind: 'fields'; fields: Array<{ key: string; value: string }> }
  | { kind: 'text'; text: string }
  | null;

const renderValue = (value: unknown): string => {
  if (value === null) return 'null';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean')
    return String(value);
  return JSON.stringify(value, null, 2);
};

/** a plain object → its entries as rows; {} carries nothing worth a table */
const asFields = (value: object): ParsedDescription => {
  const fields = Object.entries(value).map(([key, entry]) => ({
    key,
    value: renderValue(entry),
  }));
  return fields.length ? { kind: 'fields', fields } : null;
};

export const parseDescription = (description?: unknown): ParsedDescription => {
  if (description == null) return null;

  // what the live service actually sends: an object, already parsed
  if (typeof description === 'object') {
    // an array is not a field set — it reads better whole
    if (Array.isArray(description)) {
      return description.length
        ? { kind: 'text', text: JSON.stringify(description, null, 2) }
        : null;
    }
    return asFields(description);
  }

  // what the spec promises, and what some operations really do write
  if (typeof description !== 'string') {
    return { kind: 'text', text: String(description) };
  }
  const raw = description.trim();
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return asFields(parsed);
    }
    return { kind: 'text', text: raw };
  } catch {
    return { kind: 'text', text: raw };
  }
};

/** who did it, said the way a person would — the obo user only when it differs */
export const actorLine = (entry: HistoryEntry): string => {
  const jwt = entry.jwtUser ?? 'someone';
  const obo = entry.oboUser;
  return obo && obo !== jwt ? `${jwt} for ${obo}` : jwt;
};

/** the tenants, only when they disagree — same-tenant is the boring case */
export const tenantLine = (entry: HistoryEntry): string | null => {
  const jwt = entry.jwtTenant;
  const obo = entry.oboTenant;
  if (!jwt && !obo) return null;
  if (!obo || obo === jwt) return jwt ?? null;
  return `${jwt} → ${obo}`;
};

/**
 * Newest first, which is what "what just happened" wants. The service
 * returns oldest-first; entries without a stamp keep their relative
 * order at the end rather than being dropped.
 */
export const newestFirst = (items: HistoryEntry[]): HistoryEntry[] =>
  [...items].sort((a, b) => (b.created ?? '').localeCompare(a.created ?? ''));

export type HistoryDay = { day: string; items: HistoryEntry[] };

/** the ISO stamp's date half, which is the day grouping the ledger needs */
export const dayOf = (entry: HistoryEntry): string =>
  (entry.created ?? '').slice(0, 10) || 'undated';

/** newest day first, entries newest-first inside it */
export const groupByDay = (items: HistoryEntry[]): HistoryDay[] => {
  const days: HistoryDay[] = [];
  newestFirst(items).forEach((item) => {
    const day = dayOf(item);
    const last = days[days.length - 1];
    if (last && last.day === day) last.items.push(item);
    else days.push({ day, items: [item] });
  });
  return days;
};

/** how many of each operation, most frequent first — the dialog's filters */
export const countByOperation = (
  items: HistoryEntry[]
): Array<{ operation: string; n: number }> => {
  const counts = new Map<string, number>();
  items.forEach((item) => {
    const op = item.operation ?? 'unknown';
    counts.set(op, (counts.get(op) ?? 0) + 1);
  });
  return [...counts.entries()]
    .map(([operation, n]) => ({ operation, n }))
    .sort((a, b) => b.n - a.n || a.operation.localeCompare(b.operation));
};

/** the clock half of the stamp, seconds included — HH:MM:SS */
export const timeOf = (entry: HistoryEntry): string => {
  const raw = entry.created ?? '';
  const at = raw.indexOf('T');
  return at < 0 ? '' : raw.slice(at + 1, at + 9);
};
