import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import renderComponent from 'testing/utils';
import { Systems as SystemsHooks, useTapisConfig } from '@tapis/tapisui-hooks';
import { Systems } from '@tapis/tapis-typescript';
import SystemAccessPanel from './SystemAccessPanel';

jest.mock('@tapis/tapisui-hooks');
jest.mock('@tapis/tapisui-common', () => {
  const actual = jest.requireActual('@tapis/tapisui-common');
  const nothing = () => null;
  return {
    ...actual,
    ChangeOwnerModal: nothing,
    ShareSystemPublicModal: nothing,
    UnShareSystemPublicModal: nothing,
  };
});

const system = (over: object = {}): Systems.TapisSystem =>
  ({
    id: 'frontera',
    owner: 'cgarcia',
    isPublic: false,
    sharedWithUsers: ['ana', 'bo'],
    ...over,
  } as never);

const mutation = () => ({
  isLoading: false,
  isSuccess: false,
  isError: false,
  error: null,
  reset: jest.fn(),
  invalidate: jest.fn(),
});

let share: jest.Mock;
let unShare: jest.Mock;
let grant: jest.Mock;
let revoke: jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  share = jest.fn();
  unShare = jest.fn();
  grant = jest.fn();
  revoke = jest.fn();
  (useTapisConfig as jest.Mock).mockReturnValue({
    username: 'cgarcia',
    claims: { 'tapis/username': 'cgarcia' },
  });
  (SystemsHooks.useUserPermsMap as jest.Mock).mockReturnValue({
    data: { ana: ['READ', 'MODIFY'], bo: [] },
    isLoading: false,
    error: null,
  });
  (SystemsHooks.useShareSystem as jest.Mock).mockReturnValue({
    ...mutation(),
    share,
  });
  (SystemsHooks.useUnShareSystem as jest.Mock).mockReturnValue({
    ...mutation(),
    unShare,
  });
  (SystemsHooks.useGrantUserPerms as jest.Mock).mockReturnValue({
    ...mutation(),
    grant,
  });
  (SystemsHooks.useRevokeUserPerms as jest.Mock).mockReturnValue({
    ...mutation(),
    revoke,
  });
});

describe('SystemAccessPanel — the owner', () => {
  it('sees the whole map: shares, per-user rights, every door', () => {
    renderComponent(<SystemAccessPanel system={system()} />);
    expect(screen.getByText('Sharing & access')).toBeInTheDocument();
    expect(screen.getByText('cgarcia')).toBeInTheDocument();
    expect(screen.getByText('you')).toBeInTheDocument();
    expect(screen.getByText(/private: owner and shared/)).toBeInTheDocument();
    // both shared users, twice each: the share chip and the perms row
    expect(screen.getAllByText('ana').length).toBe(2);
    expect(screen.getAllByText('bo').length).toBe(2);
    // ana's held rights read filled; the doors exist
    expect(
      screen.getByRole('button', { name: 'transfer' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'make public' })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '+ share' })).toBeInTheDocument();
  });

  it('grants on a hollow chip — MODIFY bringing READ along', () => {
    renderComponent(<SystemAccessPanel system={system()} />);
    // bo holds nothing; bo's row is the second — chips are labelled by perm
    const modifyChips = screen.getAllByText('modify');
    fireEvent.click(modifyChips[1]);
    expect(grant).toHaveBeenCalledWith(
      {
        systemId: 'frontera',
        userName: 'bo',
        reqPerms: { permissions: ['MODIFY', 'READ'] },
      },
      expect.anything()
    );
    expect(revoke).not.toHaveBeenCalled();
  });

  it('revokes on a filled chip', () => {
    renderComponent(<SystemAccessPanel system={system()} />);
    const readChips = screen.getAllByText('read');
    fireEvent.click(readChips[0]);
    expect(revoke).toHaveBeenCalledWith(
      {
        systemId: 'frontera',
        userName: 'ana',
        reqPerms: { permissions: ['READ'] },
      },
      expect.anything()
    );
    expect(grant).not.toHaveBeenCalled();
  });

  it('shares inline: press, type, add', () => {
    renderComponent(<SystemAccessPanel system={system()} />);
    fireEvent.click(screen.getByRole('button', { name: '+ share' }));
    fireEvent.change(screen.getByPlaceholderText('username'), {
      target: { value: 'newbie' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'add' }));
    expect(share).toHaveBeenCalledWith(
      { systemId: 'frontera', reqShareUpdate: { users: ['newbie'] } },
      expect.anything()
    );
  });

  it('unshares from the chip itself', () => {
    renderComponent(<SystemAccessPanel system={system()} />);
    const anaChip = screen.getAllByText('ana')[0].closest('.MuiChip-root')!;
    fireEvent.click(anaChip.querySelector('.MuiChip-deleteIcon')!);
    expect(unShare).toHaveBeenCalledWith(
      { systemId: 'frontera', reqShareUpdate: { users: ['ana'] } },
      expect.anything()
    );
  });
});

describe('SystemAccessPanel — everyone else', () => {
  beforeEach(() => {
    (SystemsHooks.useUserPermsMap as jest.Mock).mockReturnValue({
      data: { cgarcia: ['READ'] },
      isLoading: false,
      error: null,
    });
  });

  it('reads but cannot press — and is told who can', () => {
    renderComponent(
      <SystemAccessPanel system={system({ owner: 'pi-owner' })} />
    );
    expect(screen.queryByRole('button', { name: 'transfer' })).toBeNull();
    expect(screen.queryByRole('button', { name: '+ share' })).toBeNull();
    expect(screen.queryByRole('button', { name: /make p/ })).toBeNull();
    expect(
      screen.getByText(/only the owner \(pi-owner\) can change/)
    ).toBeInTheDocument();
    // their own row still answers what they hold
    expect(screen.getByText('you')).toBeInTheDocument();
    fireEvent.click(screen.getAllByText('read')[0]);
    expect(grant).not.toHaveBeenCalled();
    expect(revoke).not.toHaveBeenCalled();
  });
});

describe('SystemAccessPanel — deleted', () => {
  it('shows the facts, offers nothing', () => {
    renderComponent(<SystemAccessPanel system={system()} deleted />);
    expect(screen.getByText('cgarcia')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'transfer' })).toBeNull();
    expect(screen.queryByRole('button', { name: '+ share' })).toBeNull();
    expect(
      screen.getByText('read-only, the system is deleted')
    ).toBeInTheDocument();
  });
});
