/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import FileViewerPanel from './FileViewerPanel';

const { readUrl } = vi.hoisted(() => ({ readUrl: vi.fn() }));

vi.mock('@tapis/tapisui-hooks', () => ({
  Files: {
    PostIts: { useCreate: () => ({ create: vi.fn() }) },
    useMove: () => ({ move: vi.fn() }),
  },
}));
vi.mock('./listingSource', async (importOriginal) => ({
  ...((await importOriginal()) as object),
  useFileListingSource: () => source,
}));

const source = { readUrl, can: {} };

const file = (name: string) =>
  ({ name, path: `/data/${name}`, type: 'file', size: 100 } as any);

const FILE_A = file('a.txt');

const viewer = (name: string) => (
  <FileViewerPanel systemId="sys" file={file(name)} onClose={() => {}} />
);

const deferred = <T,>() => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((r) => (resolve = r));
  return { promise, resolve };
};

describe('stepping past a file', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    readUrl.mockReset();
    fetchMock = vi.fn(() => new Promise(() => {}));
    vi.stubGlobal('fetch', fetchMock);
  });
  afterEach(() => vi.unstubAllGlobals());

  it('aborts the download of the file it left', async () => {
    readUrl.mockImplementation(async (_: string, f: { name: string }) => {
      return `blob:${f.name}`;
    });
    const { rerender } = render(viewer('a.txt'));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    const { signal } = fetchMock.mock.calls[0][1];
    expect(signal.aborted).toBe(false);

    rerender(viewer('b.txt'));
    await waitFor(() => expect(signal.aborted).toBe(true));
    await waitFor(() =>
      expect(fetchMock.mock.calls.at(-1)?.[0]).toBe('blob:b.txt')
    );
  });

  it('aborts on close', async () => {
    readUrl.mockResolvedValue('blob:a.txt');
    const { unmount } = render(viewer('a.txt'));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    unmount();
    expect(fetchMock.mock.calls[0][1].signal.aborted).toBe(true);
  });

  it('keeps one read when the caller passes a new callback', async () => {
    readUrl.mockResolvedValue('blob:a.txt');
    const panel = () => (
      <FileViewerPanel
        systemId="sys"
        file={FILE_A}
        onClose={() => {}}
        onUnavailable={() => {}}
      />
    );
    const { rerender } = render(panel());
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    const { signal } = fetchMock.mock.calls[0][1];

    rerender(panel());
    rerender(panel());
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(signal.aborted).toBe(false);
  });

  it('ignores a slow URL for the previous file', async () => {
    const first = deferred<string>();
    readUrl.mockImplementation((_: string, f: { name: string }) =>
      f.name === 'a.txt' ? first.promise : Promise.resolve('blob:b.txt')
    );
    const { rerender } = render(viewer('a.txt'));
    rerender(viewer('b.txt'));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));

    first.resolve('blob:a.txt');
    await new Promise((r) => setTimeout(r, 0));
    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual(['blob:b.txt']);
  });
});
