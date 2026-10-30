import {
  FILE_NAVIGATION_HISTORY_LIMIT,
  createFileNavigationHistory,
  createHistoryEntry,
  fileNavigationHistoryStorageKey,
  moveFileNavigationHistory,
  parseFileNavigationHistory,
  recentFileNavigationOptions,
  recordFileNavigationPath,
  serializeFileNavigationHistory,
} from './navigationHistory';

const entry = (path: string, minute: number) =>
  createHistoryEntry(
    path,
    new Date(`2026-09-08T12:${String(minute).padStart(2, '0')}:00Z`)
  );

describe('Files V2 navigation history', () => {
  it('starts at the normalized current path and ignores consecutive duplicates', () => {
    const initial = createFileNavigationHistory(
      'projects/models/',
      entry('projects/models/', 0)
    );
    const duplicate = recordFileNavigationPath(
      initial,
      '/projects/models',
      entry('/projects/models', 1)
    );

    expect(initial.entries[0]?.path).toBe('/projects/models');
    expect(duplicate).toBe(initial);
  });

  it('truncates the forward branch after a new navigation', () => {
    let history = createFileNavigationHistory('/one', entry('/one', 0));
    history = recordFileNavigationPath(history, '/two', entry('/two', 1));
    history = recordFileNavigationPath(history, '/three', entry('/three', 2));
    history = moveFileNavigationHistory(history, 0);
    history = recordFileNavigationPath(history, '/four', entry('/four', 3));

    expect(history.entries.map(({ path }) => path)).toEqual(['/one', '/four']);
    expect(history.index).toBe(1);
  });

  it('keeps only the 100 newest entries', () => {
    let history = createFileNavigationHistory('/0', entry('/0', 0));
    for (
      let value = 1;
      value <= FILE_NAVIGATION_HISTORY_LIMIT + 5;
      value += 1
    ) {
      history = recordFileNavigationPath(
        history,
        `/${value}`,
        createHistoryEntry(`/${value}`, new Date(2026, 8, 8, 13, value))
      );
    }

    expect(history.entries).toHaveLength(FILE_NAVIGATION_HISTORY_LIMIT);
    expect(history.entries[0]?.path).toBe('/6');
    expect(history.entries.at(-1)?.path).toBe('/105');
    expect(history.index).toBe(FILE_NAVIGATION_HISTORY_LIMIT - 1);
  });

  it('offers unique previous paths in most-recent-first order', () => {
    let history = createFileNavigationHistory('/one', entry('/one', 0));
    history = recordFileNavigationPath(history, '/two', entry('/two', 1));
    history = recordFileNavigationPath(history, '/one', entry('/one', 2));
    history = recordFileNavigationPath(history, '/three', entry('/three', 3));

    expect(
      recentFileNavigationOptions(history).map(({ path }) => path)
    ).toEqual(['/one', '/two']);
  });

  it('round-trips valid state and rejects malformed storage', () => {
    const history = recordFileNavigationPath(
      createFileNavigationHistory('/', entry('/', 0)),
      '/models',
      entry('/models', 1)
    );

    expect(
      parseFileNavigationHistory(serializeFileNavigationHistory(history))
    ).toEqual(history);
    expect(parseFileNavigationHistory('{not-json')).toBeUndefined();
    expect(
      parseFileNavigationHistory('{"version":1,"entries":[]}')
    ).toBeUndefined();
  });

  it('isolates storage keys by tenant, user, and system', () => {
    const base = {
      basePath: 'https://tenant.tapis.io',
      username: 'user',
      systemId: 'system-a',
    };

    expect(fileNavigationHistoryStorageKey(base)).not.toBe(
      fileNavigationHistoryStorageKey({ ...base, systemId: 'system-b' })
    );
    expect(fileNavigationHistoryStorageKey(base)).not.toBe(
      fileNavigationHistoryStorageKey({ ...base, username: 'another-user' })
    );
    expect(fileNavigationHistoryStorageKey(base)).not.toBe(
      fileNavigationHistoryStorageKey({
        ...base,
        basePath: 'https://other.tapis.io',
      })
    );
  });
});
