import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import renderComponent from 'testing/utils';
import { Files as Hooks } from '@tapis/tapisui-hooks';
import {
  FileListing,
  resetListingPrefs,
  setListingVariant,
} from '@tapis/tapisui-common';

jest.mock('@tapis/tapisui-hooks');

const DENIED =
  'FILES_CLIENT_SSH_PERM_DENIED OboTenant: tacc OboUser: nathandf ' +
  'Operation: ls System: stampede2.exec.nathandf EffectiveUser: nathandf ' +
  'Host: stampede2.tacc.utexas.edu Path: / ' +
  'Error: SFTP error (SSH_FX_PERMISSION_DENIED): Permission denied';

const NO_CREDENTIALS =
  'SSH_POOL_MISSING_CREDENTIALS Missing credentials Tenant: tacc, ' +
  'Host: stampede2.tacc.utexas.edu, Port: 22, EffectiveUserId: nathandf, ' +
  'AuthnMethod: PKI_KEYS';

const failWith = (message: string) => {
  (Hooks.useList as jest.Mock).mockReturnValue({
    concatenatedResults: undefined,
    isLoading: false,
    error: new Error(message),
  });
};

beforeEach(() => {
  window.localStorage.clear();
  resetListingPrefs();
  (Hooks as any).useUpload = () => ({ uploadAsync: jest.fn() });
});

const render = (
  props: {
    path?: string;
    onBack?: () => void;
    onUp?: () => void;
    onTop?: () => void;
  } = {}
) =>
  renderComponent(
    <FileListing
      systemId="stampede2.exec.nathandf"
      path={props.path ?? '/'}
      onBack={props.onBack}
      onUp={props.onUp}
      onTop={props.onTop}
    />
  );

describe('a directory that will not open', () => {
  it('explains it inside the explorer, which is still there around it', () => {
    // it used to replace the table outright, so a locked directory read as a
    // broken page rather than as one door among many
    failWith(DENIED);
    render();

    expect(
      screen.getByText('You do not have permission to read this directory')
    ).toBeInTheDocument();
    // the explorer's own furniture survived: the column header and the
    // switches that still work on the next directory you try
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Toggle row density')).toBeInTheDocument();
    expect(
      screen.getByText('Could not read this directory')
    ).toBeInTheDocument();
  });

  it('never prints the raw chain over the top of it', () => {
    failWith(DENIED);
    render();
    expect(screen.queryByText('An error occured')).not.toBeInTheDocument();
    expect(screen.queryByText('Nothing here')).not.toBeInTheDocument();
  });

  it('does the same for a system that has no credentials yet', () => {
    failWith(NO_CREDENTIALS);
    render();
    expect(
      screen.getByText('This system needs your credentials')
    ).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
  });

  it('climbs one directory per press, not two', () => {
    // the table has its own ← and ⌫; the standalone handler used to be
    // mounted as well, and both fired
    const onBack = jest.fn();
    failWith(DENIED);
    render({ onBack, path: '/scratch/runs' });
    fireEvent.keyDown(window, { key: 'ArrowLeft' });
    expect(onBack).toHaveBeenCalledTimes(1);
  });
});

describe('the way out it offers', () => {
  it('offers nothing to climb when you are already at the top', () => {
    // "Browse stampede2" was an offer to go where you are standing, and it
    // was being made every time
    failWith(DENIED);
    render({ onUp: jest.fn(), onTop: jest.fn(), path: '/' });
    expect(screen.queryByText(/^Top of/)).toBeNull();
    expect(screen.queryByRole('button', { name: /^Parent/ })).toBeNull();
  });

  it('never offers back — history is not an answer to a locked door', () => {
    // from a link or a fresh tab there is none, and where you happened to be
    // before is not where you were trying to go
    failWith(DENIED);
    render({ onBack: jest.fn(), onUp: jest.fn(), path: '/scratch/runs' });
    expect(screen.queryByText('Back')).toBeNull();
  });

  it('names the directory the parent button lands on', () => {
    const onUp = jest.fn();
    failWith(DENIED);
    render({ onUp, path: '/scratch/runs/01' });
    // "Up to runs" read like a quantity; "Parent · runs" only reads one way
    fireEvent.click(screen.getByRole('button', { name: /Parent.*runs/ }));
    expect(onUp).toHaveBeenCalled();
  });

  it('names the system when the parent is the top of it', () => {
    failWith(DENIED);
    render({ onUp: jest.fn(), path: '/scratch' });
    expect(
      screen.getByRole('button', { name: /Parent.*stampede2\.exec\.nathandf/ })
    ).toBeInTheDocument();
    expect(screen.queryByText(/^Top of/)).toBeNull();
  });

  it('never offers top-of-system — parent, creds, details is the menu', () => {
    // field feedback: the top button doubled the parent at depth one and
    // added a third climb everywhere else
    failWith(DENIED);
    render({ path: '/scratch/runs/01', onTop: jest.fn(), onUp: jest.fn() });
    expect(screen.queryByText(/^Top of/)).toBeNull();
  });

  it('reads nothing-at-the-top as the root, not as a moved path', () => {
    // "/" cannot have been moved or deleted — it is the system definition's
    // RootDir, and the host saying it is not there means creds or definition
    failWith(
      'FILES_CLIENT_SSH_NOT_FOUND Path not found. OboTenant: portals ' +
        'OboUser: cgarcia System: system22 EffectiveUser: crabs ' +
        'Host: te.edu RootDir: /home Path:  '
    );
    render({ path: '/' });
    expect(
      screen.getByText('Nothing at the top of this system')
    ).toBeInTheDocument();
    expect(screen.getByText(/logged in as crabs/)).toBeInTheDocument();
    expect(screen.getByText('/home')).toBeInTheDocument();
    expect(
      screen.getByText(/start by checking your credentials/)
    ).toBeInTheDocument();
    // the button the other refusals already carry
    expect(screen.getByText('Check creds')).toBeInTheDocument();
  });

  it('keeps moved-or-deleted for a path deep in a system', () => {
    failWith(
      'FILES_CLIENT_SSH_NOT_FOUND Path not found. Host: te.edu ' +
        'RootDir: /home Path: scratch/runs'
    );
    render({ path: '/scratch/runs' });
    expect(screen.getByText('Nothing at this path')).toBeInTheDocument();
    expect(screen.getByText(/moved or deleted/)).toBeInTheDocument();
    // nothing on the system page helps with a deleted subdirectory
    expect(screen.queryByText('Check creds')).toBeNull();
  });

  it('reads a refusal at the top as being about the account', () => {
    // the root of a system is normally readable, so a no from there is not
    // the "one directory among many on a shared filesystem" story
    failWith(DENIED);
    render({ path: '/' });
    expect(
      screen.getByText(/usually a credential problem/)
    ).toBeInTheDocument();
    expect(screen.getByText('Check creds')).toBeInTheDocument();
  });

  it('keeps that reading for a directory deep in a filesystem', () => {
    failWith(DENIED);
    render({ path: '/scratch/runs' });
    expect(screen.queryByText(/usually a credential problem/)).toBeNull();
  });
  it('still stands in for the listing on the classic table', () => {
    // V1 has nowhere to host an explanation, so there it is the page
    setListingVariant('classic');
    failWith(DENIED);
    render();
    expect(
      screen.getByText('You do not have permission to read this directory')
    ).toBeInTheDocument();
    expect(screen.queryByText('Could not read this directory')).toBeNull();
  });
});
