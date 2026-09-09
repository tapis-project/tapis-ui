/**
 * The Sign in press must raise the login dialog, not navigate.
 *
 * It used to `history.push('/login')`: a full trip out of the app that, on an
 * implicit-auth deployment, bounced straight back to the landing route with
 * this banner still on it. LoginDialog exists so that never happens, and
 * `loginPromptState` in location state is what opens it.
 *
 * These run under HashRouter, the router the app actually mounts, and that is
 * the point of them. The fix that replaced the push passed state as a second
 * argument to history.replace, on the belief that the app runs history 5.
 * It does not: HashRouter runs history 4, whose hash history throws that
 * argument away, so the press did nothing. The old tests ran under
 * MemoryRouter, whose memory history keeps the argument, and passed.
 */
import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { HashRouter, useLocation, useHistory } from 'react-router-dom';
import PreloginBanner from './PreloginBanner';

type Seen = {
  pathname: string;
  search: string;
  state: unknown;
  action: string;
};

const Probe: React.FC<{ out: { current?: Seen } }> = ({ out }) => {
  const location = useLocation();
  const history = useHistory();
  out.current = {
    pathname: location.pathname,
    search: location.search,
    state: location.state,
    action: history.action,
  };
  return null;
};

// The history the probe sees, so a test can drive it directly.
const HistoryOut: React.FC<{
  out: { current?: ReturnType<typeof useHistory> };
}> = ({ out }) => {
  out.current = useHistory();
  return null;
};

const renderAt = (path: string) => {
  window.location.hash = `#${path}`;
  const out: { current?: Seen } = {};
  render(
    <HashRouter>
      <PreloginBanner />
      <Probe out={out} />
    </HashRouter>
  );
  return out;
};

describe('the pre-login banner', () => {
  afterEach(() => {
    window.location.hash = '';
  });

  it('opens the login dialog in place instead of leaving the page', () => {
    const seen = renderAt('/icicle/services');
    fireEvent.click(screen.getByText('Sign in'));
    // still on the public page: no /login, no identity-provider round trip,
    // no bounce back to the landing route
    expect(seen.current?.pathname).toBe('/icicle/services');
    expect(seen.current?.state).toMatchObject({ loginModal: true });
  });

  it('keeps the query string, so the page it opens over is unchanged', () => {
    const seen = renderAt('/icicle/services?tab=upcoming');
    fireEvent.click(screen.getByText('Sign in'));
    expect(seen.current?.search).toBe('?tab=upcoming');
    expect(seen.current?.state).toMatchObject({ loginModal: true });
  });

  it('replaces rather than pushes, so Back does not reopen the dialog', () => {
    const seen = renderAt('/icicle/services');
    fireEvent.click(screen.getByText('Sign in'));
    expect(seen.current?.action).toBe('REPLACE');
  });

  // The premise the old fix got wrong, pinned. If a router upgrade ever makes
  // this fail, the second-argument form has started working, which is fine;
  // what must never come back is a producer that depends on it.
  it('runs on a router that discards a second state argument', () => {
    window.location.hash = '#/icicle/services';
    const seen: { current?: Seen } = {};
    const history: { current?: ReturnType<typeof useHistory> } = {};
    render(
      <HashRouter>
        <Probe out={seen} />
        <HistoryOut out={history} />
      </HashRouter>
    );
    const warn = jest.spyOn(console, 'error').mockImplementation(() => {});
    const warnLog = jest.spyOn(console, 'warn').mockImplementation(() => {});
    React.act(() => {
      history.current!.replace(
        { pathname: '/icicle/services' },
        { loginModal: true }
      );
    });
    warn.mockRestore();
    warnLog.mockRestore();
    expect(seen.current?.state).toBeUndefined();
  });

  it('still says what it is there to say', () => {
    renderAt('/icicle/services');
    expect(
      screen.getByText(/browsing without being signed in/)
    ).toBeInTheDocument();
  });

  it('carries no dismiss button — this one is not the user to close', () => {
    renderAt('/icicle/services');
    expect(
      screen.queryByRole('button', { name: /hide|close|dismiss/i })
    ).toBeNull();
    expect(screen.getByText('Sign in')).toBeInTheDocument();
  });
});
