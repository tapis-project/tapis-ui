import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react';
import renderComponent from 'testing/utils';
import Login from './Login';
import { isLocalhost } from 'utils/resolveBasePath';

// Login.tsx calls fetch() to probe the implicit OAuth endpoint; jsdom has no fetch
global.fetch = jest.fn().mockResolvedValue({ type: 'error', status: 0 });

// Stub the extension seam: importing the real module pulls every initialized
// extension's built dist (react-leaflet et al.) into jsdom. The no-extension
// path is also exactly what these tests exercise.
// `mock`-prefixed so jest's hoisting allows the reference inside the factory.
let mockExtension: any = undefined;
jest.mock('extensions', () => ({
  useExtension: () => ({ extension: mockExtension, extensionName: undefined }),
}));

/** An SSO-only deployment (icicleai): implicit configured, password refused. */
const ssoOnlyExtension = {
  getAuthByType: (type: string) =>
    type === 'implicit'
      ? {
          authorizationPath: 'https://icicleai.tapis.io/v3/oauth2/authorize',
          clientId: 'tapisui-implicit-client',
          redirectURI: 'https://icicleai.tapis.io/#/oauth2',
          responseType: 'token',
        }
      : undefined,
  loginPage: undefined,
};

jest.mock('utils/resolveBasePath', () => ({
  ...jest.requireActual('utils/resolveBasePath'),
  isLocalhost: jest.fn().mockReturnValue(true),
}));
const isLocalhostMock = isLocalhost as jest.Mock;

describe('Login', () => {
  beforeEach(() => {
    mockExtension = undefined;
    sessionStorage.clear();
    (global.fetch as jest.Mock).mockClear();
    (global.fetch as jest.Mock).mockResolvedValue({ type: 'error', status: 0 });
  });
  it('renders the password form expanded on localhost (implicit suppressed)', () => {
    isLocalhostMock.mockReturnValue(true);
    const { getAllByText, queryByText, queryByTestId } = renderComponent(
      <Login />
    );
    expect(getAllByText(/Username/).length).toEqual(1);
    expect(queryByTestId('tapis-auth-login')).toBeNull();
  });

  it('offers only SSO in production when the tenant has an OAuth2 client', async () => {
    isLocalhostMock.mockReturnValue(false);
    (global.fetch as jest.Mock).mockResolvedValue({
      type: 'opaqueredirect',
      status: 0,
    });
    const { findByText, queryByText, findByTestId } = renderComponent(
      <Login />
    );
    expect(await findByTestId('tapis-auth-login')).toBeDefined();
    expect(queryByText(/Username/)).toBeNull();
    expect(queryByText(/username & password/)).toBeNull();
  });

  // A tenant nobody has made the client for must not be a dead end: the
  // probe that finds no client is what brings the password form back.
  it('falls back to the password form when the probe finds no client', async () => {
    isLocalhostMock.mockReturnValue(false);
    const { findByLabelText } = renderComponent(<Login />);
    expect(await findByLabelText('Username')).toBeDefined();
  });

  it('is ready at once for a client that answered before, and still re-checks', async () => {
    isLocalhostMock.mockReturnValue(false);
    (global.fetch as jest.Mock).mockResolvedValue({
      type: 'opaqueredirect',
      status: 0,
    });
    const first = renderComponent(<Login />);
    await first.findByTestId('tapis-auth-login');
    first.unmount();
    const again = renderComponent(<Login />);
    // ready at once: no "Checking sign-in service" on the second visit
    expect(again.getByTestId('tapis-auth-login')).toBeDefined();
    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(2));
  });

  // A client that breaks mid-session must not stay hidden behind the cache.
  it('brings the password form back when a remembered client stops answering', async () => {
    isLocalhostMock.mockReturnValue(false);
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      type: 'opaqueredirect',
      status: 0,
    });
    const first = renderComponent(<Login />);
    await first.findByTestId('tapis-auth-login');
    first.unmount();
    // the default mock (a failed probe) answers the background re-check
    const again = renderComponent(<Login />);
    expect(await again.findByLabelText('Username')).toBeDefined();
    expect(sessionStorage.getItem('tapis-sso-client-ok')).toBeNull();
  });

  // An SSO-only tenant forces every user through the IdP, which is where MFA
  // is enforced — the password form must not be reachable in production.
  it('offers no password form for an SSO-only extension in production', () => {
    isLocalhostMock.mockReturnValue(false);
    mockExtension = ssoOnlyExtension;
    // The auto-redirect calls window.location.replace, which jsdom logs as
    // unimplemented — harmless here; the assertion is about what renders.
    const { queryByText } = renderComponent(<Login />);
    expect(queryByText(/Username/)).toBeNull();
    expect(queryByText(/username & password/)).toBeNull();
  });

  // ...but localhost can never complete that redirect (the redirectURI points
  // at the production host), so a dev machine still gets a usable method.
  it('still offers the password form on localhost for an SSO-only extension', () => {
    isLocalhostMock.mockReturnValue(true);
    mockExtension = ssoOnlyExtension;
    const { getAllByText, queryByText, getByText, queryByTestId } =
      renderComponent(<Login />);
    expect(getAllByText(/Username/).length).toEqual(1);
    // no SSO button — the redirect could not come back to localhost
    expect(queryByTestId('tapis-auth-login')).toBeNull();
    // ...and the form is labelled as the dev-only affordance it is
    expect(getByText(/Tapis Auth only in production/)).toBeDefined();
  });

  it('marks Tapis in the hints, and drops the Required chips', () => {
    isLocalhostMock.mockReturnValue(true);
    const { getAllByText, queryByText } = renderComponent(<Login />);
    const marks = getAllByText('Tapis');
    expect(marks).toHaveLength(2);
    marks.forEach((mark: HTMLElement) =>
      expect(mark.className).toMatch(/tapisMark/)
    );
    expect(queryByText('Required')).toBeNull();
  });

  // A plain tenant on localhost: the form stands in for SSO, and says so.
  it('labels the password form as a development stand-in on localhost', () => {
    isLocalhostMock.mockReturnValue(true);
    const { getByText } = renderComponent(<Login />);
    expect(getByText(/Tapis Auth is off on localhost/)).toBeDefined();
  });

  it('carries no development label in production', async () => {
    isLocalhostMock.mockReturnValue(false);
    const { findByLabelText, queryByText } = renderComponent(<Login />);
    await findByLabelText('Username');
    expect(queryByText('local dev')).toBeNull();
  });

  // Typing in one field must not raise the other field's error before the
  // user has reached it; a submit still shows everything that is missing.
  it('holds a field error until the field is visited or the form submitted', async () => {
    isLocalhostMock.mockReturnValue(true);
    const { getByLabelText, queryByText, findByText, getByRole } =
      renderComponent(<Login />);
    fireEvent.change(getByLabelText('Username'), {
      target: { value: 'someone' },
    });
    await new Promise((r) => setTimeout(r, 50));
    expect(queryByText('Enter your password')).toBeNull();
    fireEvent.click(getByRole('button', { name: 'Log in' }));
    expect(await findByText('Enter your password')).toBeDefined();
  });

  it('starts the cursor in Username when the password form is the only way in', () => {
    isLocalhostMock.mockReturnValue(true);
    const { getByLabelText } = renderComponent(<Login />);
    expect(document.activeElement).toBe(getByLabelText('Username'));
  });

  describe('show password', () => {
    it('is hidden by default and reveals in place, keeping what was typed', () => {
      isLocalhostMock.mockReturnValue(true);
      const { getByLabelText, getByRole, queryByRole } = renderComponent(
        <Login />
      );
      const input = getByLabelText('Password') as HTMLInputElement;
      expect(input.type).toBe('password');
      // nothing to show yet: no eye
      expect(queryByRole('button', { name: 'Show password' })).toBeNull();
      fireEvent.change(input, { target: { value: 'hunter2' } });
      fireEvent.click(getByRole('button', { name: 'Show password' }));
      // the same element, not a remounted one: focus and caret survive
      expect(getByLabelText('Password')).toBe(input);
      expect(input.type).toBe('text');
      expect(input.value).toBe('hunter2');
      const hide = getByRole('button', { name: 'Hide password' });
      expect(hide.getAttribute('aria-pressed')).toBe('true');
      fireEvent.click(hide);
      expect(input.type).toBe('password');
    });

    it('hides the password again once the form is sent', async () => {
      isLocalhostMock.mockReturnValue(true);
      const { getByLabelText, getByRole } = renderComponent(<Login />);
      fireEvent.change(getByLabelText('Username'), {
        target: { value: 'someone' },
      });
      fireEvent.change(getByLabelText('Password'), {
        target: { value: 'hunter2' },
      });
      fireEvent.click(getByRole('button', { name: 'Show password' }));
      fireEvent.click(getByRole('button', { name: 'Log in' }));
      await waitFor(() =>
        expect((getByLabelText('Password') as HTMLInputElement).type).toBe(
          'password'
        )
      );
    });
  });
});
