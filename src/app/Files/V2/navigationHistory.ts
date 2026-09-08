import { normalizeFilePath } from './utils';

export const FILE_NAVIGATION_HISTORY_LIMIT = 100;
const STORAGE_VERSION = 1;
const STORAGE_PREFIX = 'tapisui.files.v2.navigation-history';

export interface FileNavigationHistoryEntry {
  id: string;
  path: string;
  visitedAt: string;
}

export interface FileNavigationHistoryState {
  entries: FileNavigationHistoryEntry[];
  index: number;
}

export interface FileNavigationHistoryOption
  extends FileNavigationHistoryEntry {
  index: number;
}

type StoredHistory = FileNavigationHistoryState & { version: number };

let entrySequence = 0;

export const createHistoryEntry = (
  path: string,
  now = new Date()
): FileNavigationHistoryEntry => ({
  id: `${now.getTime()}-${entrySequence++}`,
  path: normalizeFilePath(path),
  visitedAt: now.toISOString(),
});

export const createFileNavigationHistory = (
  path: string,
  entry = createHistoryEntry(path)
): FileNavigationHistoryState => ({ entries: [entry], index: 0 });

export const recordFileNavigationPath = (
  state: FileNavigationHistoryState,
  path: string,
  entry = createHistoryEntry(path)
): FileNavigationHistoryState => {
  const normalizedPath = normalizeFilePath(path);
  if (state.entries[state.index]?.path === normalizedPath) return state;

  const nextEntries = [
    ...state.entries.slice(0, state.index + 1),
    { ...entry, path: normalizedPath },
  ];
  const overflow = Math.max(
    0,
    nextEntries.length - FILE_NAVIGATION_HISTORY_LIMIT
  );
  const entries = overflow ? nextEntries.slice(overflow) : nextEntries;
  return { entries, index: entries.length - 1 };
};

export const moveFileNavigationHistory = (
  state: FileNavigationHistoryState,
  index: number
): FileNavigationHistoryState => ({
  ...state,
  index: Math.min(state.entries.length - 1, Math.max(0, index)),
});

export const recentFileNavigationOptions = (
  state: FileNavigationHistoryState
): FileNavigationHistoryOption[] => {
  const currentPath = state.entries[state.index]?.path;
  const paths = new Set<string>();
  const options: FileNavigationHistoryOption[] = [];

  for (let index = state.entries.length - 1; index >= 0; index -= 1) {
    const entry = state.entries[index];
    if (!entry || entry.path === currentPath || paths.has(entry.path)) continue;
    paths.add(entry.path);
    options.push({ ...entry, index });
  }

  return options;
};

export const fileNavigationHistoryStorageKey = ({
  basePath,
  username,
  systemId,
}: {
  basePath: string;
  username: string;
  systemId: string;
}) =>
  [STORAGE_PREFIX, basePath, username, systemId]
    .map((part) => encodeURIComponent(part))
    .join(':');

export const parseFileNavigationHistory = (
  value: string | null
): FileNavigationHistoryState | undefined => {
  if (!value) return undefined;
  try {
    const parsed = JSON.parse(value) as Partial<StoredHistory>;
    if (
      parsed.version !== STORAGE_VERSION ||
      !Array.isArray(parsed.entries) ||
      !parsed.entries.length ||
      typeof parsed.index !== 'number' ||
      !Number.isInteger(parsed.index) ||
      !parsed.entries.every(
        (entry) =>
          entry &&
          typeof entry.id === 'string' &&
          typeof entry.path === 'string' &&
          typeof entry.visitedAt === 'string'
      )
    ) {
      return undefined;
    }

    const overflow = Math.max(
      0,
      parsed.entries.length - FILE_NAVIGATION_HISTORY_LIMIT
    );
    const entries = parsed.entries.slice(overflow).map((entry) => ({
      ...entry,
      path: normalizeFilePath(entry.path),
    })) as FileNavigationHistoryEntry[];
    return moveFileNavigationHistory(
      { entries, index: parsed.index - overflow },
      parsed.index - overflow
    );
  } catch {
    return undefined;
  }
};

export const serializeFileNavigationHistory = (
  state: FileNavigationHistoryState
) => JSON.stringify({ version: STORAGE_VERSION, ...state });
