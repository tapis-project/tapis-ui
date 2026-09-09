import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import renderComponent from 'testing/utils';
import { Apps as AppsHooks, useTapisConfig } from '@tapis/tapisui-hooks';
import AppAccessPanel from './AppAccessPanel';

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

let share: jest.Mock;
let unShare: jest.Mock;
let makePublic: jest.Mock;
let makePrivate: jest.Mock;
let grant: jest.Mock;
let revoke: jest.Mock;

const shareInfo = (over: object = {}) =>
  (AppsHooks.useShareInfo as jest.Mock).mockReturnValue({
    data: { result: { _public: false, userList: [], ...over } },
    isLoading: false,
    error: null,
  });

const permsMap = (map: Record<string, string[]> = {}) =>
  (AppsHooks.useAppUserPermsMap as jest.Mock).mockReturnValue({
    data: map,
    isLoading: false,
    error: null,
  });

beforeEach(() => {
  jest.clearAllMocks();
  share = jest.fn();
  unShare = jest.fn();
  makePublic = jest.fn();
  makePrivate = jest.fn();
  grant = jest.fn();
  revoke = jest.fn();
  (useTapisConfig as jest.Mock).mockReturnValue({
    claims: { 'tapis/username': 'cgarcia' },
  });
  shareInfo();
  permsMap();
  (AppsHooks.useShareApp as jest.Mock).mockReturnValue(mutation({ share }));
  (AppsHooks.useUnShareApp as jest.Mock).mockReturnValue(mutation({ unShare }));
  (AppsHooks.useShareAppPublic as jest.Mock).mockReturnValue(
    mutation({ shareAppPublic: makePublic })
  );
  (AppsHooks.useUnShareAppPublic as jest.Mock).mockReturnValue(
    mutation({ unShareAppPublic: makePrivate })
  );
  (AppsHooks.useGrantAppPerms as jest.Mock).mockReturnValue(
    mutation({ grant })
  );
  (AppsHooks.useRevokeAppPerms as jest.Mock).mockReturnValue(
    mutation({ revoke })
  );
  (AppsHooks.useChangeAppOwner as jest.Mock).mockReturnValue(
    mutation({ changeOwner: jest.fn() })
  );
});

const app = (over: object = {}) => ({
  id: 'flexserv',
  owner: 'cgarcia',
  ...over,
});

describe('what the panel says', () => {
  it('reads visibility and the share list', () => {
    renderComponent(<AppAccessPanel app={app()} />);
    expect(screen.getByText(/private: owner and shared/)).toBeInTheDocument();
    expect(screen.getByText('no one yet')).toBeInTheDocument();
  });

  it('prefers the share read over the record for public', () => {
    // the record can be stale; getShareInfo is the authoritative answer
    shareInfo({ _public: true, userList: ['ana'] });
    permsMap({ ana: ['READ'] });
    renderComponent(<AppAccessPanel app={app({ isPublic: false })} />);
    expect(screen.getByText(/public: the whole tenant/)).toBeInTheDocument();
    // named twice on purpose: once as a share chip, once as a
    // permissions row — the same person, two different questions
    expect(screen.getAllByText('ana')).toHaveLength(2);
  });

  it('warns that the two doors are independent when both are open', () => {
    shareInfo({ _public: true, userList: ['ana'] });
    renderComponent(<AppAccessPanel app={app()} />);
    expect(screen.getByText(/separate doors/)).toBeInTheDocument();
  });

  it('leaves availability to the lifecycle panel next door', () => {
    renderComponent(<AppAccessPanel app={app()} />);
    expect(screen.queryByText('disable')).not.toBeInTheDocument();
  });
});

describe('the owner gate', () => {
  it('offers nothing to change to someone who is not the owner', () => {
    shareInfo({ userList: ['ana'] });
    permsMap({ ana: ['READ'] });
    renderComponent(<AppAccessPanel app={app({ owner: 'someone-else' })} />);
    expect(screen.queryByText('make public')).not.toBeInTheDocument();
    expect(screen.queryByText('+ share')).not.toBeInTheDocument();
    expect(screen.queryByText('transfer')).not.toBeInTheDocument();
    expect(screen.getByText(/Only someone-else can change this/)).toBeVisible();
    // the permissions are still SHOWN — read-only is not blank
    expect(screen.getByText('read')).toBeInTheDocument();
  });
});

describe('the presses', () => {
  it('makes public, and private again', () => {
    const { unmount } = renderComponent(<AppAccessPanel app={app()} />);
    fireEvent.click(screen.getByText('make public'));
    expect(makePublic).toHaveBeenCalledWith('flexserv');
    unmount();

    shareInfo({ _public: true });
    renderComponent(<AppAccessPanel app={app()} />);
    fireEvent.click(screen.getByText('make private'));
    expect(makePrivate).toHaveBeenCalledWith('flexserv');
  });

  it('shares with a named user from the inline field', () => {
    renderComponent(<AppAccessPanel app={app()} />);
    fireEvent.click(screen.getByText('+ share'));
    fireEvent.change(screen.getByPlaceholderText('username'), {
      target: { value: 'ana' },
    });
    fireEvent.click(screen.getByText('add'));
    expect(share).toHaveBeenCalledWith(
      { appId: 'flexserv', users: ['ana'] },
      expect.anything()
    );
  });

  it('will not share a blank name', () => {
    renderComponent(<AppAccessPanel app={app()} />);
    fireEvent.click(screen.getByText('+ share'));
    fireEvent.change(screen.getByPlaceholderText('username'), {
      target: { value: '   ' },
    });
    expect(screen.getByText('add')).toBeDisabled();
  });

  it('unshares the user whose chip was dismissed', () => {
    shareInfo({ userList: ['ana', 'bo'] });
    permsMap({ ana: [], bo: [] });
    renderComponent(<AppAccessPanel app={app()} />);
    fireEvent.click(screen.getAllByTestId('CancelIcon')[0]);
    expect(unShare).toHaveBeenCalledWith({
      appId: 'flexserv',
      users: ['ana'],
    });
  });

  it('opens the transfer dialog, which says what is lost', () => {
    renderComponent(<AppAccessPanel app={app()} />);
    fireEvent.click(screen.getByText('transfer'));
    expect(screen.getByText(/Transfer ownership/)).toBeInTheDocument();
    expect(screen.getByText(/transfer it back/)).toBeInTheDocument();
  });

  it('says what the service refused, rather than failing silently', () => {
    (AppsHooks.useShareAppPublic as jest.Mock).mockReturnValue(
      mutation({
        shareAppPublic: makePublic,
        error: new Error('APPAPI_UNAUTH not yours'),
      })
    );
    renderComponent(<AppAccessPanel app={app()} />);
    expect(screen.getByText(/APPAPI_UNAUTH not yours/)).toBeInTheDocument();
  });
});

describe('the permission chips', () => {
  it('shows what each shared person holds', () => {
    shareInfo({ userList: ['ana'] });
    permsMap({ ana: ['READ', 'EXECUTE'] });
    renderComponent(<AppAccessPanel app={app()} />);
    expect(screen.getByText('read').closest('div')).toHaveClass(
      'MuiChip-filled'
    );
    expect(screen.getByText('modify').closest('div')).toHaveClass(
      'MuiChip-outlined'
    );
  });

  it('pairs READ with the verb when granting — MODIFY alone is unusable', () => {
    shareInfo({ userList: ['ana'] });
    permsMap({ ana: [] });
    renderComponent(<AppAccessPanel app={app()} />);
    fireEvent.click(screen.getByText('modify'));
    expect(grant).toHaveBeenCalledWith({
      appId: 'flexserv',
      userName: 'ana',
      reqPerms: { permissions: ['READ', 'MODIFY'] },
    });
  });

  it('grants READ alone as itself', () => {
    shareInfo({ userList: ['ana'] });
    permsMap({ ana: [] });
    renderComponent(<AppAccessPanel app={app()} />);
    fireEvent.click(screen.getByText('read'));
    expect(grant).toHaveBeenCalledWith({
      appId: 'flexserv',
      userName: 'ana',
      reqPerms: { permissions: ['READ'] },
    });
  });

  it('revokes just the one pressed', () => {
    shareInfo({ userList: ['ana'] });
    permsMap({ ana: ['READ', 'EXECUTE'] });
    renderComponent(<AppAccessPanel app={app()} />);
    fireEvent.click(screen.getByText('execute'));
    expect(revoke).toHaveBeenCalledWith({
      appId: 'flexserv',
      userName: 'ana',
      reqPerms: { permissions: ['EXECUTE'] },
    });
  });
});
