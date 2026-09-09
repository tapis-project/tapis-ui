import {
  HistoryEntry,
  actorLine,
  countByOperation,
  groupByDay,
  newestFirst,
  opLabel,
  opTone,
  parseDescription,
  tenantLine,
  timeOf,
} from '../historyLedger';

const at = (created: string, over: object = {}): HistoryEntry =>
  ({
    created,
    operation: 'MODIFY',
    jwtUser: 'cgarcia',
    ...over,
  } as HistoryEntry);

describe('operation vocabulary', () => {
  it('colours by family, and reds the ones that end something', () => {
    expect(opTone('CREATE').family).toBe('lifecycle');
    expect(opTone('CREATE').color).toBe('#1b7f3b');
    expect(opTone('SET_CRED').family).toBe('credentials');
    // destructive wins over its family's colour
    expect(opTone('DELETE').color).toBe('#c62828');
    expect(opTone('REVOKE_PERMS').color).toBe('#c62828');
    // and still reports the family it belongs to
    expect(opTone('REVOKE_PERMS').family).toBe('access');
  });

  it('does not crash on an operation the service adds next release', () => {
    expect(opTone('QUANTUM_ENTANGLE').color).toBeTruthy();
    expect(opLabel('QUANTUM_ENTANGLE')).toBe('quantum entangle');
    expect(opLabel(undefined)).toBe('unknown');
  });

  it('says CHANGE_OWNER the way a person would', () => {
    expect(opLabel('CHANGE_OWNER')).toBe('change owner');
  });
});

describe('the ledger description', () => {
  it('reads the service JSON as fields', () => {
    const parsed = parseDescription('{"enabled":false,"port":2222}');
    expect(parsed).toEqual({
      kind: 'fields',
      fields: [
        { key: 'enabled', value: 'false' },
        { key: 'port', value: '2222' },
      ],
    });
  });

  it('keeps a nested value whole rather than flattening it away', () => {
    const parsed = parseDescription(
      '{"jobRuntimes":[{"runtimeType":"DOCKER"}]}'
    );
    expect(parsed?.kind).toBe('fields');
    if (parsed?.kind === 'fields') {
      expect(parsed.fields[0].value).toContain('DOCKER');
    }
  });

  it('falls back to prose when it is prose, not a crash', () => {
    expect(parseDescription('System created.')).toEqual({
      kind: 'text',
      text: 'System created.',
    });
    // an array is not a field set — it reads better whole
    expect(parseDescription('[1,2]')?.kind).toBe('text');
  });

  it('has nothing to say about nothing', () => {
    expect(parseDescription(undefined)).toBeNull();
    expect(parseDescription(null)).toBeNull();
    expect(parseDescription('   ')).toBeNull();
    // an empty object must not draw an empty table
    expect(parseDescription('{}')).toBeNull();
    expect(parseDescription({})).toBeNull();
    expect(parseDescription([])).toBeNull();
  });

  // The spec declares description a string. The live service sends an
  // already-parsed object, and calling .trim() on it took the whole
  // dialog down. Both shapes must land in the same place.
  it('takes the OBJECT the live service really sends, not just the spec string', () => {
    expect(parseDescription({ enabled: false, port: 2222 })).toEqual({
      kind: 'fields',
      fields: [
        { key: 'enabled', value: 'false' },
        { key: 'port', value: '2222' },
      ],
    });
    // and agrees with itself across the two shapes
    expect(parseDescription({ enabled: false })).toEqual(
      parseDescription('{"enabled":false}')
    );
  });

  it('keeps a nested object value readable rather than [object Object]', () => {
    const parsed = parseDescription({ notes: { project: 'apcd' } });
    expect(parsed?.kind).toBe('fields');
    if (parsed?.kind === 'fields') {
      expect(parsed.fields[0].value).toContain('apcd');
      expect(parsed.fields[0].value).not.toContain('[object');
    }
  });

  it('does not throw on a shape nobody predicted', () => {
    expect(() => parseDescription(42)).not.toThrow();
    expect(() => parseDescription(true)).not.toThrow();
    expect(parseDescription(42)).toEqual({ kind: 'text', text: '42' });
  });
});

describe('who did it', () => {
  it('names the obo user only when it differs', () => {
    expect(actorLine(at('x', { jwtUser: 'ana' }))).toBe('ana');
    expect(actorLine(at('x', { jwtUser: 'ana', oboUser: 'ana' }))).toBe('ana');
    expect(actorLine(at('x', { jwtUser: 'svc', oboUser: 'ana' }))).toBe(
      'svc for ana'
    );
  });

  it('names both tenants only when they disagree', () => {
    expect(tenantLine(at('x', { jwtTenant: 'dev', oboTenant: 'dev' }))).toBe(
      'dev'
    );
    expect(tenantLine(at('x', { jwtTenant: 'admin', oboTenant: 'dev' }))).toBe(
      'admin → dev'
    );
    expect(tenantLine(at('x'))).toBeNull();
  });
});

describe('ordering and grouping', () => {
  const items = [
    at('2026-09-01T10:00:00Z'),
    at('2026-09-03T08:30:00Z'),
    at('2026-09-03T14:15:00Z'),
  ];

  it('puts what just happened first', () => {
    expect(newestFirst(items).map((i) => i.created)).toEqual([
      '2026-09-03T14:15:00Z',
      '2026-09-03T08:30:00Z',
      '2026-09-01T10:00:00Z',
    ]);
    // the input is not rearranged under the caller
    expect(items[0].created).toBe('2026-09-01T10:00:00Z');
  });

  it('breaks the run into days, newest day leading', () => {
    const days = groupByDay(items);
    expect(days.map((d) => d.day)).toEqual(['2026-09-03', '2026-09-01']);
    expect(days[0].items).toHaveLength(2);
    expect(days[0].items[0].created).toBe('2026-09-03T14:15:00Z');
  });

  it('keeps an undated entry rather than dropping it', () => {
    const days = groupByDay([...items, at('')]);
    expect(days.some((d) => d.day === 'undated')).toBe(true);
    expect(days.reduce((n, d) => n + d.items.length, 0)).toBe(4);
  });

  it('counts the operations, most frequent first', () => {
    expect(
      countByOperation([
        at('a', { operation: 'MODIFY' }),
        at('b', { operation: 'CREATE' }),
        at('c', { operation: 'MODIFY' }),
      ])
    ).toEqual([
      { operation: 'MODIFY', n: 2 },
      { operation: 'CREATE', n: 1 },
    ]);
  });

  it('reads the clock off the stamp, and shrugs at a stamp without one', () => {
    expect(timeOf(at('2026-09-03T14:15:09Z'))).toBe('14:15:09');
    expect(timeOf(at('2026-09-03'))).toBe('');
  });
});
