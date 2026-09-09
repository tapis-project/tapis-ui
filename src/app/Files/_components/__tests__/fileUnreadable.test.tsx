import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import renderComponent from 'testing/utils';
import { Files } from '@tapis/tapis-typescript';
import { Files as Hooks } from '@tapis/tapisui-hooks';
import { FileListing, resetListingPrefs } from '@tapis/tapisui-common';

jest.mock('@tapis/tapisui-hooks');

/**
 * The one that sent us here: a .txt the unix account cannot read. The viewer
 * opened onto "Could not fetch this file / 500 from the file" — the status
 * of a response whose body said, in three sentences, exactly which user was
 * refused on which host.
 */
const DENIED =
  'FILES_CONT_ERR GetContents error. Tenant: null ApiUserId: null OboTenant: tacc ' +
  'OboUser: cgarcia System: frontera.cgarcia Path: admin/c101-021_syscfg.txt ' +
  'Error: FILES_OPSC_ERR Operations error. Operation: getAllBytes ' +
  'System: frontera.cgarcia Path: admin/c101-021_syscfg.txt ' +
  'Error: FILES_CLIENT_SSH_OP_ERR1 Error during operation. OboTenant: tacc ' +
  'OboUser: cgarcia Operation: getStream System: frontera.cgarcia ' +
  'EffectiveUser: cgarcia Host: frontera.tacc.utexas.edu ' +
  'Path: admin/c101-021_syscfg.txt Error: Permission denied';

const listing = [
  {
    name: 'c101-021_syscfg.txt',
    path: '/admin/c101-021_syscfg.txt',
    type: Files.FileTypeEnum.File,
    size: 1024,
    lastModified: new Date('2026-08-30T12:00:00Z'),
  } as Files.FileInfo,
];

const respondWith = (body: string, ok = false) => {
  (global as any).fetch = jest.fn(() =>
    Promise.resolve({
      ok,
      status: ok ? 200 : 500,
      text: () => Promise.resolve(body),
    })
  );
};

beforeEach(() => {
  window.localStorage.clear();
  resetListingPrefs();
  (Hooks.useList as jest.Mock).mockReturnValue({
    concatenatedResults: listing,
    isLoading: false,
    error: null,
  });
  (Hooks as any).PostIts = {
    useCreate: () => ({
      create: (_p: unknown, opts: any) =>
        opts?.onSuccess?.({ result: { redeemUrl: 'https://tapis.test/p/1' } }),
      isLoading: false,
      isError: false,
    }),
  };
  (Hooks as any).useMove = () => ({ move: jest.fn(), isLoading: false });
  (Hooks as any).useUpload = () => ({ uploadAsync: jest.fn() });
});

const openIt = () => {
  renderComponent(<FileListing systemId="frontera.cgarcia" path="/admin" />);
  fireEvent.doubleClick(screen.getByText('c101-021_syscfg.txt'));
};

describe('opening a file the system refuses to read', () => {
  it('says why, where a message about what you just pressed belongs', async () => {
    respondWith(
      JSON.stringify({ status: 'Internal Server Error', message: DENIED })
    );
    openIt();

    expect(await screen.findByText('Permission denied')).toBeInTheDocument();
    // the file is named in the sentence, so the notice stands on its own
    // once the window it would have opened is gone
    expect(
      screen.getByText(
        /frontera.tacc.utexas.edu let Tapis in as cgarcia, but c101-021_syscfg.txt isn't readable by that account/
      )
    ).toBeInTheDocument();
  });

  it('shuts the window rather than framing the failure in one', async () => {
    respondWith(JSON.stringify({ message: DENIED }));
    openIt();

    await screen.findByText('Permission denied');
    // the viewer's own chrome is gone: it had nothing to show, and the
    // listing behind it was never broken
    await waitFor(() =>
      expect(screen.queryByLabelText('Close viewer')).not.toBeInTheDocument()
    );
    expect(screen.queryByText(/500 from the file/)).not.toBeInTheDocument();
  });

  it('can be dismissed, and goes on its own', async () => {
    respondWith(JSON.stringify({ message: DENIED }));
    openIt();

    await screen.findByText('Permission denied');
    fireEvent.click(screen.getByLabelText('Dismiss'));
    await waitFor(() =>
      expect(screen.queryByText('Permission denied')).not.toBeInTheDocument()
    );
  });

  it('leaves a failure it cannot explain in the window, where the detail is', async () => {
    respondWith('<html>502 Bad Gateway</html>');
    openIt();

    expect(await screen.findByText(/502 Bad Gateway/)).toBeInTheDocument();
    // nothing better to say in passing than what is already on screen
    expect(screen.getByLabelText('Close viewer')).toBeInTheDocument();
  });
});
