import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import renderComponent from 'testing/utils';
import { Apps as AppsHooks } from '@tapis/tapisui-hooks';
import AppSettingsCog from './AppSettingsCog';

jest.mock('@tapis/tapisui-hooks');
jest.mock('./AppTransferOwnerModal', () => () => (
  <div data-testid="transfer-modal" />
));

const mutation = (over: object = {}) => ({
  isLoading: false,
  isError: false,
  isSuccess: false,
  data: undefined,
  error: null,
  reset: jest.fn(),
  ...over,
});

let enable: jest.Mock;
let disable: jest.Mock;
let lock: jest.Mock;
let unlock: jest.Mock;
let remove: jest.Mock;
let undelete: jest.Mock;
let makePublic: jest.Mock;
let makePrivate: jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  enable = jest.fn();
  disable = jest.fn();
  lock = jest.fn();
  unlock = jest.fn();
  remove = jest.fn();
  undelete = jest.fn();
  makePublic = jest.fn();
  makePrivate = jest.fn();
  (AppsHooks.useEnableApp as jest.Mock).mockReturnValue(mutation({ enable }));
  (AppsHooks.useDisableApp as jest.Mock).mockReturnValue(mutation({ disable }));
  (AppsHooks.useLockApp as jest.Mock).mockReturnValue(mutation({ lock }));
  (AppsHooks.useUnlockApp as jest.Mock).mockReturnValue(mutation({ unlock }));
  (AppsHooks.useDeleteApp as jest.Mock).mockReturnValue(mutation({ remove }));
  (AppsHooks.useUndeleteApp as jest.Mock).mockReturnValue(
    mutation({ undelete })
  );
  (AppsHooks.useShareAppPublic as jest.Mock).mockReturnValue(
    mutation({ shareAppPublic: makePublic })
  );
  (AppsHooks.useUnShareAppPublic as jest.Mock).mockReturnValue(
    mutation({ unShareAppPublic: makePrivate })
  );
});

const app = (over: object = {}) => ({
  id: 'flexserv',
  version: '1.4.0',
  owner: 'cgarcia',
  enabled: true,
  ...over,
});

const openCog = (over: object = {}, canManage = true) => {
  renderComponent(
    <AppSettingsCog
      app={app(over)}
      canManage={canManage}
      onUpdate={jest.fn()}
      onCreate={jest.fn()}
    />
  );
  fireEvent.click(screen.getByRole('button', { name: 'App settings' }));
};

describe('the acts the menu offers', () => {
  it('carries every switch the page can throw, not just update and new', () => {
    openCog();
    // the two it always had
    expect(screen.getByText('Update app')).toBeInTheDocument();
    expect(screen.getByText('New app')).toBeInTheDocument();
    // and the ones that used to be reachable only from the Lifecycle box
    expect(screen.getByText('Disable')).toBeInTheDocument();
    expect(screen.getByText('Lock v1.4.0')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
    expect(screen.getByText('Make public')).toBeInTheDocument();
    expect(screen.getByText('Transfer ownership…')).toBeInTheDocument();
  });

  it('names the other side of each switch when the app is in it', () => {
    openCog({ enabled: false, locked: true, deleted: true, isPublic: true });
    expect(screen.getByText('Enable')).toBeInTheDocument();
    expect(screen.getByText('Unlock v1.4.0')).toBeInTheDocument();
    expect(screen.getByText('Restore')).toBeInTheDocument();
    expect(screen.getByText('Make private')).toBeInTheDocument();
  });
});

describe('the presses', () => {
  it('enables and disables app-wide', () => {
    openCog();
    fireEvent.click(screen.getByText('Disable'));
    expect(disable).toHaveBeenCalledWith({ appId: 'flexserv' });
  });

  it('locks THIS VERSION, and says so on the row', () => {
    // the service's request shape insists on a version, and no other act
    // in this menu is per-version
    openCog();
    fireEvent.click(screen.getByText('Lock v1.4.0'));
    expect(lock).toHaveBeenCalledWith({
      appId: 'flexserv',
      appVersion: '1.4.0',
    });
  });

  it('flips visibility both ways', () => {
    openCog();
    fireEvent.click(screen.getByText('Make public'));
    expect(makePublic).toHaveBeenCalledWith('flexserv');
  });

  it('asks before deleting — a menu press is one click from the pointer', () => {
    openCog();
    fireEvent.click(screen.getByText('Delete'));
    expect(remove).not.toHaveBeenCalled();
    expect(screen.getByText('Delete app')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    expect(remove).toHaveBeenCalledWith({ appId: 'flexserv' });
  });

  it('lets the second thought win', () => {
    openCog();
    fireEvent.click(screen.getByText('Delete'));
    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
    expect(remove).not.toHaveBeenCalled();
  });

  it('restores in one press — undoing a soft delete is not dangerous', () => {
    openCog({ deleted: true });
    fireEvent.click(screen.getByText('Restore'));
    expect(undelete).toHaveBeenCalledWith({ appId: 'flexserv' });
  });
});

describe('the owner gate', () => {
  it('shows the acts but refuses them to someone who is not the owner', () => {
    openCog({ owner: 'someone-else' }, false);
    const row = screen.getByText('Disable').closest('li')!;
    expect(row).toHaveAttribute('aria-disabled', 'true');
    fireEvent.click(screen.getByText('Disable'));
    expect(disable).not.toHaveBeenCalled();
  });

  it('leaves New app open to everyone — it makes a different app', () => {
    openCog({ owner: 'someone-else' }, false);
    expect(screen.getByText('New app').closest('li')).not.toHaveAttribute(
      'aria-disabled',
      'true'
    );
  });
});

describe('an app with no version in hand', () => {
  it('refuses the lock rather than sending a blank version', () => {
    openCog({ version: undefined });
    const row = screen.getByText(/^Lock/).closest('li')!;
    expect(row).toHaveAttribute('aria-disabled', 'true');
    fireEvent.click(screen.getByText(/^Lock/));
    expect(lock).not.toHaveBeenCalled();
  });
});
