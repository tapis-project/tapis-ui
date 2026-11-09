import { Apps } from '@tapis/tapis-typescript';
import {
  columnById,
  DEFAULT_COLUMN_IDS,
  discoverTagKeys,
  getAppsColumns,
  parseKeyedTag,
  resetAppsColumns,
  setAppsColumns,
  sortApps,
  tagColumn,
  toggleAppsColumn,
} from '../appsColumns';
import type { AppRunContext } from '../appsData';

const app = (over: object = {}): Apps.TapisApp =>
  ({ id: 'a', version: '1.0', ...over } as Apps.TapisApp);

afterEach(() => resetAppsColumns());

describe('parseKeyedTag — the key: value convention', () => {
  it('reads portalName: dd the way a portal writes it', () => {
    expect(parseKeyedTag('portalName: dd')).toEqual({
      key: 'portalName',
      value: 'dd',
    });
  });

  it('leaves URLs and plain labels as plain tags', () => {
    // colon without whitespace is not the convention
    expect(parseKeyedTag('https://example.com')).toBeUndefined();
    expect(parseKeyedTag('gpu')).toBeUndefined();
    expect(parseKeyedTag('portalName:dd')).toBeUndefined();
  });

  it('keeps multi-word values whole', () => {
    expect(parseKeyedTag('group: vis team')).toEqual({
      key: 'group',
      value: 'vis team',
    });
  });
});

describe('discoverTagKeys', () => {
  it('collects every key the loaded apps use, sorted, once', () => {
    const apps = [
      app({ tags: ['portalName: dd', 'gpu'] }),
      app({ id: 'b', tags: ['group: vis', 'portalName: cep'] }),
      app({ id: 'c' }),
    ];
    expect(discoverTagKeys(apps)).toEqual(['group', 'portalName']);
  });
});

describe('tag columns', () => {
  it('reads its value off the row, empty when the app never says', () => {
    const column = tagColumn('portalName');
    expect(column.value(app({ tags: ['portalName: dd', 'gpu'] }))).toBe('dd');
    expect(column.value(app({ tags: ['gpu'] }))).toBe('');
    expect(column.value(app())).toBe('');
  });

  it('round-trips through columnById', () => {
    expect(columnById('tag:portalName')?.label).toBe('portalName');
    expect(columnById('runs')?.label).toBe('Runs');
    expect(columnById('app')?.label).toBe('App');
    expect(columnById('nope')).toBeUndefined();
  });
});

describe('the chosen columns store', () => {
  it('ships the six the table always had', () => {
    expect(getAppsColumns()).toEqual(DEFAULT_COLUMN_IDS);
  });

  it('toggles keep the registry order for built-ins', () => {
    toggleAppsColumn('queue');
    // queue sits between runs-on and updated in the registry, so it lands
    // before runs/lastRun rather than dangling at the end
    const ids = getAppsColumns();
    expect(ids).toContain('queue');
    expect(ids.indexOf('queue')).toBeLessThan(ids.indexOf('runs'));
    toggleAppsColumn('queue');
    expect(getAppsColumns()).toEqual(DEFAULT_COLUMN_IDS);
  });

  it('tag columns ride at the end and survive a reload', () => {
    toggleAppsColumn('tag:portalName');
    expect(getAppsColumns().slice(-1)).toEqual(['tag:portalName']);
    expect(
      JSON.parse(window.localStorage.getItem('apps.columns') ?? '[]')
    ).toContain('tag:portalName');
  });
});

describe('sortApps', () => {
  const ctxByApp = new Map<string, AppRunContext>([
    ['a', { total: 3, failed: 0, running: 0 } as AppRunContext],
    ['b', { total: 12, failed: 0, running: 0 } as AppRunContext],
  ]);
  const ctxOf = (a: Apps.TapisApp) => ctxByApp.get(a.id ?? '');
  const rows = [
    app({ id: 'a', jobAttributes: { execSystemLogicalQueue: 'normal' } }),
    app({ id: 'b', jobAttributes: { execSystemLogicalQueue: 'gpu-a100' } }),
    app({ id: 'c' }),
  ];

  it('null sort leaves the page order alone', () => {
    expect(sortApps(rows, null, ctxOf)).toBe(rows);
  });

  it('sorts text case-insensitively, empties last either way', () => {
    const asc = sortApps(rows, { id: 'queue', dir: 'asc' }, ctxOf);
    expect(asc.map((r) => r.id)).toEqual(['b', 'a', 'c']);
    const desc = sortApps(rows, { id: 'queue', dir: 'desc' }, ctxOf);
    // c has no queue — it stays last even descending
    expect(desc.map((r) => r.id)).toEqual(['a', 'b', 'c']);
  });

  it('sorts run counts as numbers, apps outside the window last', () => {
    const desc = sortApps(rows, { id: 'runs', dir: 'desc' }, ctxOf);
    expect(desc.map((r) => r.id)).toEqual(['b', 'a', 'c']);
    const asc = sortApps(rows, { id: 'runs', dir: 'asc' }, ctxOf);
    expect(asc.map((r) => r.id)).toEqual(['a', 'b', 'c']);
  });
});
