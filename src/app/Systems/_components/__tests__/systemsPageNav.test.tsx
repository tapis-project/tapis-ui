import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import renderComponent from 'testing/utils';
import { Systems as Hooks } from '@tapis/tapisui-hooks';
import SystemsPageNav from '../SystemsPageNav/SystemsPageNav';
import { resetDeletedPref } from '../deletedSystemsPref';
import { resetNavEngine } from 'app/_components/NavSpine';

jest.mock('@tapis/tapisui-hooks');

const sys = (id: string, over: object = {}) => ({
  id,
  host: `${id}.tacc.utexas.edu`,
  systemType: 'LINUX',
  owner: 'cgarcia',
  enabled: true,
  isPublic: false,
  defaultAuthnMethod: 'PKI_KEYS',
  canExec: true,
  updated: '2026-09-01T00:00:00Z',
  ...over,
});

// a truncated window must be a FULL page — a short page completes it
const fullPage = Array.from({ length: 50 }, (_, i) => sys(`sys-${i}`));

const mockHooks = (windowOver: object = {}, deleted: object[] = []) => {
  (Hooks.useListWindow as jest.Mock).mockReturnValue({
    data: { pages: [{ items: fullPage, total: 312 }] },
    isLoading: false,
    error: null,
    hasNextPage: true,
    isFetchingNextPage: false,
    fetchNextPage: jest.fn(),
    ...windowOver,
  });
  (Hooks.useList as jest.Mock).mockReturnValue({
    data: undefined,
    isLoading: false,
    error: null,
  });
  (Hooks.useDeletedList as jest.Mock).mockReturnValue({
    data: { result: deleted },
  });
  // the trash badge opens the undelete dialog, which asks for the mutation
  (Hooks.useUndeleteSystem as jest.Mock).mockReturnValue({
    undeleteSystem: jest.fn(),
    isLoading: false,
    error: null,
    isSuccess: false,
    reset: jest.fn(),
  });
};

beforeEach(() => {
  jest.clearAllMocks();
  window.localStorage.clear();
  resetNavEngine();
  resetDeletedPref();
});

describe('the /systems nav', () => {
  it('rides the shared window, ledger pinned, rows grouped', () => {
    mockHooks();
    renderComponent(<SystemsPageNav />);
    expect(screen.getByText('50 of 312 systems')).toBeInTheDocument();
    expect(screen.getByText('sys-0')).toBeInTheDocument();
    // no deleted rows when nothing is deleted
    expect(
      document.querySelector('[data-testid="RestoreFromTrashIcon"]')
    ).toBeNull();
  });

  it('deleted systems ride the list struck through, the trash badge restoring', () => {
    mockHooks({}, [sys('retired-host', { deleted: true })]);
    renderComponent(<SystemsPageNav />);
    // in the rows with everyone else — struck through, not in a side panel
    const name = screen.getByText('retired-host');
    expect(name.closest('span')).toHaveStyle('text-decoration: line-through');
    // the gray trash badge is the restore door
    const trash = document.querySelector(
      '[data-testid="RestoreFromTrashIcon"]'
    );
    expect(trash).not.toBeNull();
    fireEvent.click(trash!);
    // the undelete dialog names the system it is about to bring back
    expect(screen.getAllByText(/retired-host/).length).toBeGreaterThanOrEqual(
      2
    );
  });

  it('never shows a system twice — the deleted listing outvotes the window', () => {
    // right after a delete the window still holds the row alive while its
    // refetch is in flight; the live copy must yield to the struck one
    mockHooks({}, [sys('sys-0', { deleted: true })]);
    renderComponent(<SystemsPageNav />);
    const rows = screen.getAllByText('sys-0');
    expect(rows).toHaveLength(1);
    expect(rows[0].closest('span')).toHaveStyle(
      'text-decoration: line-through'
    );
  });

  it('the banner under the ledger flips deleted visibility, and X dismisses', () => {
    mockHooks({}, [sys('retired-host', { deleted: true })]);
    renderComponent(<SystemsPageNav />);
    // riding: the banner says so, and the row is in the list
    expect(screen.getByText('1 deleted system shown')).toBeInTheDocument();
    expect(screen.getByText('retired-host')).toBeInTheDocument();
    // flip: the row leaves, the banner keeps the count and the way back
    fireEvent.click(screen.getByText('hide deleted'));
    expect(screen.queryByText('retired-host')).toBeNull();
    expect(screen.getByText('1 deleted system hidden')).toBeInTheDocument();
    expect(screen.getByText('show deleted')).toBeInTheDocument();
    // X: the banner goes; the row stays hidden (the pref, not the banner,
    // owns visibility) and the choice lives on in Settings
    fireEvent.click(screen.getByLabelText('Dismiss deleted-systems banner'));
    expect(screen.queryByText(/deleted system/)).toBeNull();
    expect(screen.queryByText('retired-host')).toBeNull();
  });

  it('first load keeps the chrome — search, ledger, skeleton rows', () => {
    mockHooks({ data: undefined, isLoading: true, hasNextPage: undefined });
    renderComponent(<SystemsPageNav />);
    expect(screen.getByLabelText('Search')).toBeInTheDocument();
    expect(screen.getByText('loading systems…')).toBeInTheDocument();
    expect(document.querySelector('[data-navskeleton]')).not.toBeNull();
  });
});
