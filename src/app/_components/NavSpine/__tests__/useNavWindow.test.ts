import { act, renderHook } from '@testing-library/react';
import { useNavWindow } from '../useNavWindow';

jest.mock('../spineEntities', () => ({ useSpineOverlay: () => ({}) }));

type Row = { id: string };
const page = (n: number, total?: number) => ({
  items: Array.from({ length: n }, (_, i) => ({ id: `${total}-${i}` })),
  total,
});

/** a query that answers each fetchNextPage with the next scripted result */
const scripted = (results: Array<{ pages?: any[]; isError?: boolean }>) => {
  const fetchNextPage = jest.fn();
  for (const r of results) {
    fetchNextPage.mockResolvedValueOnce({
      data: r.pages ? { pages: r.pages } : undefined,
      isError: !!r.isError,
      error: r.isError ? new Error('503') : null,
    });
  }
  const query = { data: { pages: [page(2)] }, fetchNextPage } as any;
  return { query, fetchNextPage };
};

const render = (query: any) =>
  renderHook(() =>
    useNavWindow<Row>({
      service: 'systems',
      noun: 'system',
      idOf: (r) => r.id,
      query,
      windowSize: 2,
    })
  ).result;

describe('load all', () => {
  it('walks pages until the window is complete', async () => {
    const { query, fetchNextPage } = scripted([
      { pages: [page(2), page(2)] },
      { pages: [page(2), page(2), page(1)] },
    ]);
    const result = render(query);
    await act(() => result.current.expandAll());
    expect(fetchNextPage).toHaveBeenCalledTimes(2);
  });

  // it used to retry a failing page up to 40 times back to back
  it('stops at the first failing page', async () => {
    const { query, fetchNextPage } = scripted([
      { pages: [page(2), page(2)] },
      { isError: true },
      { pages: [page(2), page(2), page(2), page(2)] },
    ]);
    const result = render(query);
    await act(() => result.current.expandAll());
    expect(fetchNextPage).toHaveBeenCalledTimes(2);
  });

  it('stops when a page brings nothing new', async () => {
    const { query, fetchNextPage } = scripted([
      { pages: [page(2), page(2)] },
      { pages: [page(2), page(2)] },
      { pages: [page(2), page(2), page(2)] },
    ]);
    const result = render(query);
    await act(() => result.current.expandAll());
    expect(fetchNextPage).toHaveBeenCalledTimes(2);
  });
});
