import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import renderComponent from 'testing/utils';
import { Apps as AppsHooks } from '@tapis/tapisui-hooks';
import AppLifecyclePanel from './AppLifecyclePanel';

jest.mock('@tapis/tapisui-hooks');

const mutation = (over: object = {}) => ({
  isLoading: false,
  isSuccess: false,
  isError: false,
  error: null,
  data: undefined,
  reset: jest.fn(),
  ...over,
});

let enable: jest.Mock;
let disable: jest.Mock;
let lock: jest.Mock;
let unlock: jest.Mock;
let remove: jest.Mock;
let undelete: jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  enable = jest.fn();
  disable = jest.fn();
  lock = jest.fn();
  unlock = jest.fn();
  remove = jest.fn();
  undelete = jest.fn();
  (AppsHooks.useEnableApp as jest.Mock).mockReturnValue(mutation({ enable }));
  (AppsHooks.useDisableApp as jest.Mock).mockReturnValue(mutation({ disable }));
  (AppsHooks.useLockApp as jest.Mock).mockReturnValue(mutation({ lock }));
  (AppsHooks.useUnlockApp as jest.Mock).mockReturnValue(mutation({ unlock }));
  (AppsHooks.useDeleteApp as jest.Mock).mockReturnValue(mutation({ remove }));
  (AppsHooks.useUndeleteApp as jest.Mock).mockReturnValue(
    mutation({ undelete })
  );
});

const app = (over: object = {}) => ({
  id: 'flexserv',
  version: '1.4.0',
  owner: 'jdoe',
  enabled: true,
  ...over,
});

describe('the switches, in the record’s own keys', () => {
  it('names each row by its field, and says its value as the record does', () => {
    renderComponent(<AppLifecyclePanel app={app()} canManage />);
    // the labels are the JSON's keys, not a paraphrase of them
    ['enabled', 'locked', 'deleted'].forEach((key) =>
      expect(screen.getByText(key)).toBeInTheDocument()
    );
    expect(screen.queryByText('listed')).toBeNull();
    expect(screen.queryByText('runnable')).toBeNull();
    // the values are the record's: true once, false twice
    expect(screen.getAllByText('true')).toHaveLength(1);
    expect(screen.getAllByText('false')).toHaveLength(2);
    // and each says what it means
    expect(
      screen.getByText(/jobs can be launched from it/)
    ).toBeInTheDocument();
    expect(screen.getByText(/v1.4.0 can be edited/)).toBeInTheDocument();
    expect(screen.getByText(/shown in nav/)).toBeInTheDocument();
    expect(screen.getByText('Lifecycle')).toBeInTheDocument();
  });

  it('reads the other side of each', () => {
    renderComponent(
      <AppLifecyclePanel
        app={app({ enabled: false, locked: true, deleted: true })}
        canManage
      />
    );
    expect(screen.getByText(/no new jobs can be launched/)).toBeInTheDocument();
    expect(screen.getByText(/v1.4.0 cannot be edited/)).toBeInTheDocument();
    expect(screen.getByText(/hidden from nav, restorable/)).toBeInTheDocument();
  });

  it('says History in its title when it carries the ledger', () => {
    renderComponent(
      <AppLifecyclePanel app={app()} history={<span>the ledger</span>} />
    );
    expect(screen.getByText('Lifecycle & History')).toBeInTheDocument();
    expect(screen.getByText('the ledger')).toBeInTheDocument();
  });

  it('shows versionEnabled only when the record carries it', () => {
    const { unmount } = renderComponent(<AppLifecyclePanel app={app()} />);
    expect(screen.queryByText('version enabled')).toBeNull();
    unmount();

    renderComponent(<AppLifecyclePanel app={app({ versionEnabled: false })} />);
    expect(screen.getByText('version enabled')).toBeInTheDocument();
    expect(screen.getByText(/v1.4.0 cannot be launched/)).toBeInTheDocument();
  });
});

describe('the presses', () => {
  it('enables and disables app-wide', () => {
    const { unmount } = renderComponent(
      <AppLifecyclePanel app={app()} canManage />
    );
    fireEvent.click(screen.getByText('disable'));
    expect(disable).toHaveBeenCalledWith({ appId: 'flexserv' });
    unmount();

    renderComponent(
      <AppLifecyclePanel app={app({ enabled: false })} canManage />
    );
    fireEvent.click(screen.getByText('enable'));
    expect(enable).toHaveBeenCalledWith({ appId: 'flexserv' });
  });

  it('locks THIS VERSION, not the app', () => {
    // the service's request shape insists on a version, and no other
    // control on this page is per-version — worth pinning down
    renderComponent(<AppLifecyclePanel app={app()} canManage />);
    fireEvent.click(screen.getByText('lock'));
    expect(lock).toHaveBeenCalledWith({
      appId: 'flexserv',
      appVersion: '1.4.0',
    });
  });

  it('unlocks the same version', () => {
    renderComponent(
      <AppLifecyclePanel app={app({ locked: true })} canManage />
    );
    fireEvent.click(screen.getByText('unlock'));
    expect(unlock).toHaveBeenCalledWith({
      appId: 'flexserv',
      appVersion: '1.4.0',
    });
  });

  it('asks twice before deleting', () => {
    renderComponent(<AppLifecyclePanel app={app()} canManage />);
    fireEvent.click(screen.getByText('delete'));
    expect(remove).not.toHaveBeenCalled();
    fireEvent.click(screen.getByText('really delete'));
    expect(remove).toHaveBeenCalledWith(
      { appId: 'flexserv' },
      expect.anything()
    );
  });

  it('lets the second thought win', () => {
    renderComponent(<AppLifecyclePanel app={app()} canManage />);
    fireEvent.click(screen.getByText('delete'));
    fireEvent.click(screen.getByText('cancel'));
    expect(screen.getByText('delete')).toBeInTheDocument();
    expect(remove).not.toHaveBeenCalled();
  });

  it('restores in one press — undoing a soft delete is not dangerous', () => {
    renderComponent(
      <AppLifecyclePanel app={app({ deleted: true })} canManage />
    );
    fireEvent.click(screen.getByText('restore'));
    expect(undelete).toHaveBeenCalledWith({ appId: 'flexserv' });
  });
});

describe('the owner gate', () => {
  it('shows the state but offers no press', () => {
    renderComponent(<AppLifecyclePanel app={app()} />);
    expect(screen.getByText('enabled')).toBeInTheDocument();
    expect(screen.queryByText('disable')).not.toBeInTheDocument();
    expect(screen.queryByText('lock')).not.toBeInTheDocument();
    expect(screen.queryByText('delete')).not.toBeInTheDocument();
  });
});

describe('an app with no version in hand', () => {
  it('hides the lock row rather than sending a blank version', () => {
    renderComponent(
      <AppLifecyclePanel app={app({ version: undefined })} canManage />
    );
    expect(screen.queryByText('locked')).not.toBeInTheDocument();
    // the other two still work
    expect(screen.getByText('disable')).toBeInTheDocument();
  });
});
