import { mergeEntity, overlayObjects, windowMeta } from '../spineModel';

const page = (n: number, total?: number) => ({
  items: Array.from({ length: n }, (_, i) => ({ id: `s${i}` })),
  total,
});

describe('what a window adds up to', () => {
  it('a full first page with a bigger total is openly incomplete', () => {
    const m = windowMeta([page(50, 312)], 50);
    expect(m).toEqual({
      loaded: 50,
      total: 312,
      complete: false,
      truncated: true,
    });
  });

  it('a short page means the server has nothing more', () => {
    const m = windowMeta([page(50, 62), page(12)], 50);
    expect(m.loaded).toBe(62);
    expect(m.total).toBe(62);
    expect(m.complete).toBe(true);
    expect(m.truncated).toBe(false);
  });

  it('reaching the announced total completes even on a full page', () => {
    // 100 of 100 in two exact pages — no third request needed to know
    const m = windowMeta([page(50, 100), page(50)], 50);
    expect(m.complete).toBe(true);
  });

  it('no pages yet is not a completed empty list', () => {
    const m = windowMeta([], 50);
    expect(m.loaded).toBe(0);
    expect(m.complete).toBe(false);
  });

  it('an empty first page is a genuinely empty, complete list', () => {
    const m = windowMeta([page(0, 0)], 50);
    expect(m.complete).toBe(true);
    expect(m.total).toBe(0);
  });

  it('keeps the count without a total when the server never said', () => {
    const m = windowMeta([page(50)], 50);
    expect(m.total).toBeUndefined();
    expect(m.truncated).toBe(true);
  });

  it('reads totalCount: -1 as unknown, never as a count', () => {
    // apps answers -1 even when asked to count — a short page still
    // completes the window and the loaded count becomes the total
    const m = windowMeta([page(12, -1)], 50);
    expect(m.complete).toBe(true);
    expect(m.total).toBe(12);

    // a full page with -1 must stay openly incomplete, not "-1 · all loaded"
    const open = windowMeta([page(50, -1)], 50);
    expect(open.complete).toBe(false);
    expect(open.total).toBeUndefined();
  });
});

describe('the overlay merge', () => {
  it('fresher fields win', () => {
    expect(
      mergeEntity({ id: 'a', status: 'PENDING' }, { status: 'RUNNING' })
    ).toEqual({ id: 'a', status: 'RUNNING' });
  });

  it('a sparse patch never erases a field it does not carry', () => {
    // the summaryAttributes lesson: absent must stay unknown, not become false
    expect(
      mergeEntity({ id: 'a', enabled: true, host: 'h' }, {
        enabled: undefined,
        host: 'h2',
      } as any)
    ).toEqual({ id: 'a', enabled: true, host: 'h2' });
  });

  it('an empty overlay hands back the same array untouched', () => {
    const items = [{ id: 'a' }];
    expect(overlayObjects(items, {}, (o) => o.id)).toBe(items);
  });

  it('patches land only on their own object', () => {
    const out = overlayObjects(
      [
        { id: 'a', v: 1 },
        { id: 'b', v: 1 },
      ],
      { b: { v: 2 } },
      (o) => o.id
    );
    expect(out).toEqual([
      { id: 'a', v: 1 },
      { id: 'b', v: 2 },
    ]);
  });

  it('a fresher window row beats a stale patch — refresh must be able to win', () => {
    // the two-blocked-jobs bug: the detail page wrote BLOCKED, the queue
    // then opened, and every refresh press lost to the old write-through
    const out = overlayObjects(
      [{ id: 'a', status: 'RUNNING', lastUpdated: '2026-09-06T10:05:00Z' }],
      { a: { status: 'BLOCKED', lastUpdated: '2026-09-06T10:00:00Z' } },
      (o) => o.id
    );
    expect(out[0].status).toBe('RUNNING');
  });

  it('a fresher patch still wins over an older window row', () => {
    const out = overlayObjects(
      [{ id: 'a', status: 'BLOCKED', lastUpdated: '2026-09-06T10:00:00Z' }],
      { a: { status: 'RUNNING', lastUpdated: '2026-09-06T10:05:00Z' } },
      (o) => o.id
    );
    expect(out[0].status).toBe('RUNNING');
  });

  it('ties and stampless patches keep the patch-wins behaviour', () => {
    const stamp = '2026-09-06T10:00:00Z';
    expect(
      overlayObjects(
        [{ id: 'a', status: 'QUEUED', lastUpdated: stamp }],
        { a: { status: 'RUNNING', lastUpdated: stamp } },
        (o) => o.id
      )[0].status
    ).toBe('RUNNING');
    expect(
      overlayObjects(
        [{ id: 'a', status: 'QUEUED', lastUpdated: stamp }],
        { a: { status: 'RUNNING' } },
        (o) => o.id
      )[0].status
    ).toBe('RUNNING');
  });
});
