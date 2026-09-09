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
  owner: 'cgarcia',
  enabled: true,
  ...over,
});

describe('the three switches, said plainly', () => {
  it('reads the resting state of each', () => {
    renderComponent(<AppLifecyclePanel app={app()} canManage />);
    // the resting states say ONE word each: they are what nearly
    // everything is, and explaining them is noise on every app forever
    expect(screen.getByText('enabled')).toBeInTheDocument();
    expect(screen.getByText('unlocked')).toBeInTheDocument();
    // label 'listed', value 'yes' — the label is the record's own field
    expect(screen.getByText('yes')).toBeInTheDocument();
  });

  it('reads the other side of each', () => {
    renderComponent(
      <AppLifecyclePanel
        app={app({ enabled: false, locked: true, deleted: true })}
        canManage
      />
    );
    expect(screen.getByText(/disabled: no new jobs/)).toBeInTheDocument();
    expect(screen.getByText(/locked: v1.4.0/)).toBeInTheDocument();
    expect(screen.getByText('deleted and restorable')).toBeInTheDocument();
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
    expect(screen.queryByText(/unlocked:/)).not.toBeInTheDocument();
    // the other two still work
    expect(screen.getByText('disable')).toBeInTheDocument();
  });
});
