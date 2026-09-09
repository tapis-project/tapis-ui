/**
 * The apps table's columns, as a registry plus a choice.
 *
 * The table shipped with six hardcoded columns while the source already
 * fetches full records (`select: 'allAttributes'`) — tags, notes, the whole
 * jobAttributes block sat unused. This registry names every column the
 * table can grow, a localStorage store remembers which ones this browser
 * shows, and tags finally earn their keep: any tag written as
 * `key: value` ("portalName: dd") surfaces its key as an addable,
 * sortable column.
 *
 * Adding a built-in is one entry here: id, label, a value() over the app
 * record (plus the run context the page already joins in), and optionally
 * a sortValue when the display text is not the thing to compare. Tenant
 * extensions are the intended next contributor — the registry is a plain
 * array, and an extension package appending its own specs is the whole
 * integration.
 */
import { Apps } from '@tapis/tapis-typescript';
import { normTs, timeAgo } from 'app/_components/NavV2Kit/navKit';
import type { AppRunContext } from './appsData';

export type AppColumnSpec = {
  id: string;
  label: string;
  /** the picker's one-line what-is */
  description?: string;
  mono?: boolean;
  /** cell text — '' renders as an empty cell, the table's usual answer */
  value: (app: Apps.TapisApp, ctx?: AppRunContext) => string;
  /** what sorting compares; defaults to value(). Rows with nothing to say
   *  sort last either direction — an empty cell is not a small value. */
  sortValue?: (app: Apps.TapisApp, ctx?: AppRunContext) => string | number;
};

export const APP_COLUMNS: AppColumnSpec[] = [
  { id: 'version', label: 'Version', value: (a) => a.version ?? '' },
  {
    id: 'runtime',
    label: 'Runtime',
    value: (a) => (a.runtime as string) ?? '',
  },
  { id: 'owner', label: 'Owner', value: (a) => a.owner ?? '' },
  {
    id: 'jobType',
    label: 'Job type',
    description: 'BATCH waits in a scheduler queue; FORK starts straight away',
    value: (a) => (a.jobType as string) ?? '',
  },
  {
    id: 'system',
    label: 'Runs on',
    mono: true,
    description: "The execution system the app's definition names",
    value: (a) => a.jobAttributes?.execSystemId ?? '',
  },
  {
    id: 'queue',
    label: 'Queue',
    mono: true,
    description: 'The logical queue the definition submits to',
    value: (a) => a.jobAttributes?.execSystemLogicalQueue ?? '',
  },
  {
    id: 'updated',
    label: 'Updated',
    description: 'When the definition itself last changed',
    value: (a) => (a.updated ? timeAgo(a.updated) : ''),
    sortValue: (a) => normTs(a.updated ?? 0),
  },
  {
    id: 'tags',
    label: 'Tags',
    description: 'Every tag, verbatim',
    value: (a) => (a.tags ?? []).join(', '),
  },
  {
    id: 'runs',
    label: 'Runs',
    description: 'Runs of this app in the loaded jobs window',
    value: (a, ctx) => (ctx ? String(ctx.total) : '—'),
    sortValue: (a, ctx) => ctx?.total ?? -1,
  },
  {
    id: 'lastRun',
    label: 'Last run',
    value: (a, ctx) => (ctx?.last ? timeAgo(ctx.last) : '—'),
    sortValue: (a, ctx) => normTs(ctx?.last ?? 0),
  },
];

// ── tag-derived columns — the `key: value` convention ──────────────────────

/** `portalName: dd` → { key: 'portalName', value: 'dd' }. The colon must be
 *  followed by whitespace so URLs and plain labels stay plain tags. */
export const parseKeyedTag = (
  tag: string
): { key: string; value: string } | undefined => {
  const match = /^([A-Za-z][\w.-]*):\s+(\S.*)$/.exec(tag.trim());
  return match ? { key: match[1], value: match[2].trim() } : undefined;
};

/** every key the loaded apps use, for the picker's "from tags" section */
export const discoverTagKeys = (apps: Array<Apps.TapisApp>): string[] => {
  const keys = new Set<string>();
  for (const app of apps) {
    for (const tag of app.tags ?? []) {
      const parsed = parseKeyedTag(tag);
      if (parsed) keys.add(parsed.key);
    }
  }
  return Array.from(keys).sort((a, b) => a.localeCompare(b));
};

/** the fixed first column — never in the picker, but sortable like the rest */
export const APP_ID_COLUMN: AppColumnSpec = {
  id: 'app',
  label: 'App',
  mono: true,
  value: (a) => a.id ?? '',
};

const TAG_PREFIX = 'tag:';

export const tagColumn = (key: string): AppColumnSpec => ({
  id: `${TAG_PREFIX}${key}`,
  label: key,
  description: `From tags of the form "${key}: value"`,
  value: (a) =>
    (a.tags ?? []).map(parseKeyedTag).find((parsed) => parsed?.key === key)
      ?.value ?? '',
});

/** a chosen id back to its spec — registry entry, tag column, or App */
export const columnById = (id: string): AppColumnSpec | undefined =>
  id === APP_ID_COLUMN.id
    ? APP_ID_COLUMN
    : id.startsWith(TAG_PREFIX)
    ? tagColumn(id.slice(TAG_PREFIX.length))
    : APP_COLUMNS.find((column) => column.id === id);

// ── the choice, remembered on this device ──────────────────────────────────

const KEY = 'apps.columns';

/** the table as it always shipped — the registry only ADDS options */
export const DEFAULT_COLUMN_IDS = [
  'version',
  'runtime',
  'owner',
  'runs',
  'lastRun',
];

const readChosen = (): string[] => {
  try {
    const raw = JSON.parse(window.localStorage.getItem(KEY) ?? 'null');
    return Array.isArray(raw) && raw.every((id) => typeof id === 'string')
      ? raw
      : DEFAULT_COLUMN_IDS;
  } catch {
    return DEFAULT_COLUMN_IDS;
  }
};

let chosen: string[] = readChosen();

const listeners = new Set<() => void>();
const announce = () => listeners.forEach((listener) => listener());

export const subscribeAppsColumns = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const getAppsColumns = (): string[] => chosen;

export const setAppsColumns = (ids: string[]) => {
  chosen = ids;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(ids));
  } catch {
    // it still holds for this visit
  }
  announce();
};

/** toggle keeps the registry's order for built-ins, appends tag columns */
export const toggleAppsColumn = (id: string) => {
  if (chosen.includes(id)) {
    setAppsColumns(chosen.filter((existing) => existing !== id));
    return;
  }
  const next = [...chosen, id];
  const order = (columnId: string) => {
    const at = APP_COLUMNS.findIndex((column) => column.id === columnId);
    // tag columns ride at the end, in the order they were added
    return at === -1 ? APP_COLUMNS.length + next.indexOf(columnId) : at;
  };
  setAppsColumns(next.sort((a, b) => order(a) - order(b)));
};

export const resetAppsColumns = () => setAppsColumns(DEFAULT_COLUMN_IDS);

// ── sorting ────────────────────────────────────────────────────────────────

export type AppsSort = { id: string; dir: 'asc' | 'desc' } | null;

/**
 * Sort rows by a column, empties last in either direction — an app without
 * a queue is not the smallest queue. Numbers compare numerically, text
 * case-insensitively; ties fall back to app id so the order is stable.
 */
export const sortApps = <T extends Apps.TapisApp>(
  rows: T[],
  sort: AppsSort,
  ctxOf: (app: T) => AppRunContext | undefined
): T[] => {
  if (!sort) return rows;
  const spec = columnById(sort.id);
  if (!spec) return rows;
  const keyOf = spec.sortValue ?? spec.value;
  const flip = sort.dir === 'desc' ? -1 : 1;
  return [...rows].sort((a, b) => {
    const ka = keyOf(a, ctxOf(a));
    const kb = keyOf(b, ctxOf(b));
    const emptyA = ka === '' || ka === -1;
    const emptyB = kb === '' || kb === -1;
    if (emptyA !== emptyB) return emptyA ? 1 : -1;
    let cmp = 0;
    if (typeof ka === 'number' && typeof kb === 'number') {
      cmp = ka - kb;
    } else {
      cmp = String(ka).localeCompare(String(kb), undefined, {
        sensitivity: 'base',
        numeric: true,
      });
    }
    return cmp * flip || (a.id ?? '').localeCompare(b.id ?? '');
  });
};
