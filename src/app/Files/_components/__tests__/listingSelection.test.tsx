import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import renderComponent from 'testing/utils';
import { Files as Hooks } from '@tapis/tapisui-hooks';
import { Files } from '@tapis/tapis-typescript';
import { FileListing, resetListingPrefs } from '@tapis/tapisui-common';

jest.mock('@tapis/tapisui-hooks');

/**
 * Selection through the whole component, not just the table.
 *
 * The table decides which rows get a tick box; FileListing decides what a
 * press on one actually does. They used to disagree: every row of a
 * selectable table grew a box, and the callback quietly refused any file
 * whose raw type was not in the filter — which no symbolic link's ever is.
 * Sorted dirs-first, links sit interleaved among the real directories, so
 * the refusals landed scattered down the listing and read as the checkbox
 * randomly not working.
 */

const entry = (
  name: string,
  extra: Partial<Files.FileInfo> = {}
): Files.FileInfo =>
  ({
    name,
    path: `/scratch/${name}`,
    type: Files.FileTypeEnum.File,
    size: 1024,
    lastModified: new Date('2026-08-30T12:00:00Z'),
    ...extra,
  } as Files.FileInfo);

// no mode string and no mime type: the guess is a directory, like $WORK
const linkedDir = entry('work', {
  type: Files.FileTypeEnum.SymbolicLink,
  mimeType: undefined,
});
const socket = entry('mysql.sock', { type: Files.FileTypeEnum.Other });
const plain = entry('tapisjob.out');

const listWith = (files: Array<Files.FileInfo>) => {
  (Hooks.useList as jest.Mock).mockReturnValue({
    concatenatedResults: files,
    isLoading: false,
    error: null,
    hasNextPage: false,
    fetchNextPage: jest.fn(),
    isFetchingNextPage: false,
    data: undefined,
  });
};

beforeEach(() => {
  window.localStorage.clear();
  resetListingPrefs();
  (Hooks as any).useUpload = () => ({ uploadAsync: jest.fn() });
});

const render = (props: Record<string, unknown> = {}) =>
  renderComponent(
    <FileListing
      systemId="frontera"
      path="/scratch"
      selectMode={{ mode: 'multi', types: ['dir', 'file'] }}
      {...props}
    />
  );

describe('selecting through FileListing', () => {
  it('lets a linked folder into the selection', () => {
    const onSelect = jest.fn();
    listWith([plain, linkedDir]);
    render({ onSelect });

    fireEvent.click(screen.getByLabelText('Select work'));
    expect(onSelect).toHaveBeenCalledWith([
      expect.objectContaining({ name: 'work' }),
    ]);
  });

  it('carries the link through a shift-run, and drops the socket', () => {
    const onSelect = jest.fn();
    listWith([plain, linkedDir, socket]);
    render({ onSelect });

    // sorted order is work (a folder as far as anyone browsing cares),
    // then mysql.sock, then tapisjob.out
    fireEvent.click(screen.getByLabelText('Select work'));
    fireEvent.click(screen.getByTestId('tapisjob.out'), { shiftKey: true });

    expect(onSelect).toHaveBeenLastCalledWith([
      expect.objectContaining({ name: 'work' }),
      expect.objectContaining({ name: 'tapisjob.out' }),
    ]);
  });

  it('select-all claims exactly the rows the boxes answer for', () => {
    const onSelect = jest.fn();
    listWith([plain, linkedDir, socket]);
    render({ onSelect });

    fireEvent.click(screen.getByTestId('select-all'));
    const selected = onSelect.mock.calls[0][0] as Array<Files.FileInfo>;
    expect(selected.map((file) => file.name)).toEqual(['tapisjob.out', 'work']);
  });

  it('gives a row nothing can operate on no box at all', () => {
    listWith([plain, socket]);
    render({ onSelect: jest.fn() });

    expect(screen.getByLabelText('Select tapisjob.out')).toBeInTheDocument();
    expect(screen.queryByLabelText('Select mysql.sock')).toBeNull();
  });
});
