import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import Cookies from 'js-cookie';
import renderComponent from 'testing/utils';
import { isLocalhost } from 'utils/resolveBasePath';
import { rememberLoginReturn } from '../../loginReturn';
import JwtBypassDialog, { jwtBypassAllowed } from './JwtBypassDialog';

jest.mock('utils/resolveBasePath', () => ({
  ...jest.requireActual('utils/resolveBasePath'),
  isLocalhost: jest.fn().mockReturnValue(false),
}));
let mockSetAccessToken: jest.Mock;
const mockPush = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: () => ({ push: mockPush }),
}));
jest.mock('@tapis/tapisui-hooks', () => ({
  ...jest.requireActual('@tapis/tapisui-hooks'),
  useTapisConfig: () => ({
    basePath: 'https://icicleai.tapis.io',
    pathTenantId: 'icicleai',
    setAccessToken: (...args: unknown[]) => mockSetAccessToken(...args),
  }),
}));

const isLocalhostMock = isLocalhost as jest.Mock;

/** Just the two getters jwtBypassAllowed reads. */
const ext = (jwtBypass?: boolean | string[], jwtBypassHosts?: string[]) =>
  ({
    getJwtBypass: () => jwtBypass,
    getJwtBypassHosts: () => jwtBypassHosts,
  } as never);

describe('jwtBypassAllowed', () => {
  beforeEach(() => isLocalhostMock.mockReturnValue(false));

  it('is on for every tenant when nothing says otherwise', () => {
    expect(jwtBypassAllowed(undefined, 'tacc')).toBe(true);
    expect(jwtBypassAllowed(ext(), 'icicleai')).toBe(true);
  });

  it('is off where the deployment turns it off', () => {
    expect(jwtBypassAllowed(ext(false), 'tacc')).toBe(false);
  });

  it('keeps it only for the tenants a list names', () => {
    expect(jwtBypassAllowed(ext(['tacc']), 'tacc')).toBe(true);
    expect(jwtBypassAllowed(ext(['tacc']), 'icicleai')).toBe(false);
  });

  it('still honours the older hostname list, [] meaning off', () => {
    expect(jwtBypassAllowed(ext(undefined, []), 'tacc')).toBe(false);
  });

  it('is always on for a local dev server', () => {
    isLocalhostMock.mockReturnValue(true);
    expect(jwtBypassAllowed(ext(false), 'tacc')).toBe(true);
  });
});

describe('JwtBypassDialog', () => {
  it('says what it is for, and warns before anything is pasted', () => {
    renderComponent(<JwtBypassDialog open onClose={jest.fn()} />);
    expect(screen.getByText('Sign in with an access token')).toBeDefined();
    expect(screen.getByText(/A debugging tool/)).toBeDefined();
    expect(
      screen.getByText(/Only paste a token you got yourself/)
    ).toBeDefined();
    expect(
      screen.getByRole('button', { name: 'Sign in with this token' })
    ).toBeDisabled();
  });

  it('refuses a paste it cannot read, inline', () => {
    renderComponent(<JwtBypassDialog open onClose={jest.fn()} />);
    fireEvent.change(screen.getByLabelText(/Access token/), {
      target: { value: 'not-a-token' },
    });
    fireEvent.click(
      screen.getByRole('button', { name: 'Sign in with this token' })
    );
    expect(screen.getByText(/not a token this page can read/)).toBeDefined();
  });
});

describe('JwtBypassDialog sign-in', () => {
  const b64 = (o: unknown) =>
    Buffer.from(JSON.stringify(o)).toString('base64url');
  const GOOD = `${b64({ alg: 'none' })}.${b64({
    exp: Math.floor(Date.now() / 1000) + 3600,
    'tapis/tenant_id': 'icicleai',
  })}.sig`;
  const submit = () => {
    fireEvent.change(screen.getByLabelText(/Access token/), {
      target: { value: GOOD },
    });
    fireEvent.click(
      screen.getByRole('button', { name: 'Sign in with this token' })
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    sessionStorage.clear();
    Cookies.remove('tapis-token');
  });

  it('hides the token as it is typed', () => {
    renderComponent(<JwtBypassDialog open onClose={jest.fn()} />);
    const field = screen.getByLabelText(/Access token/);
    expect(field.getAttribute('type')).toBe('password');
    expect(field.getAttribute('autocomplete')).toBe('off');
  });

  it('stays open with an error when the session was not stored', async () => {
    mockSetAccessToken = jest.fn().mockResolvedValue(undefined);
    const onClose = jest.fn();
    renderComponent(<JwtBypassDialog open onClose={onClose} />);
    submit();
    await screen.findByText(/session could not be stored/);
    expect(onClose).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('returns to the page the sign-in was started from', async () => {
    mockSetAccessToken = jest.fn().mockImplementation(async () => {
      Cookies.set('tapis-token', JSON.stringify({ access_token: GOOD }));
    });
    rememberLoginReturn('/pods?x=1');
    const onClose = jest.fn();
    renderComponent(<JwtBypassDialog open onClose={onClose} />);
    submit();
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/pods?x=1'));
    expect(onClose).toHaveBeenCalled();
    expect(sessionStorage.getItem('tapis-login-return')).toBeNull();
  });

  it('goes home when there is no recorded page', async () => {
    mockSetAccessToken = jest.fn().mockImplementation(async () => {
      Cookies.set('tapis-token', JSON.stringify({ access_token: GOOD }));
    });
    renderComponent(<JwtBypassDialog open onClose={jest.fn()} />);
    submit();
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/'));
  });
});
