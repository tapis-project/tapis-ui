/**
 * The other door to the login dialog, and the other one that was dead.
 *
 * An ICICLE portal that needs a session (I-SAW, and anything framed through
 * SignedInPortal) renders publicly with a Sign in press. That press passed
 * the prompt state as a second argument to history.replace, which the app's
 * hash router discards, so it did nothing, same as the banner. It lives in
 * the extension package, whose tests nothing runs, so it is pinned from here,
 * under the router the app actually mounts.
 */
import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { HashRouter, useLocation } from 'react-router-dom';
import { SignedInPortal } from '../../../../packages/icicle-tapisui-extension/src/pages/PortalShared/SignedInPortal';

const Probe: React.FC<{ out: { current?: unknown } }> = ({ out }) => {
  out.current = useLocation().state;
  return null;
};

describe('a portal that needs a session, before there is one', () => {
  afterEach(() => {
    window.location.hash = '';
  });

  it('raises the login dialog, and remembers where it was raised', () => {
    window.location.hash = '#/isaw?view=map';
    const state: { current?: unknown } = {};
    render(
      <HashRouter>
        <SignedInPortal src="https://example.org" title="I-SAW" />
        <Probe out={state} />
      </HashRouter>
    );
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(state.current).toEqual({
      loginModal: true,
      loginMessage: 'Sign in to open I-SAW.',
      from: { pathname: '/isaw' },
    });
  });

  it('frames the portal once there is a session', () => {
    window.location.hash = '#/isaw';
    render(
      <HashRouter>
        <SignedInPortal
          accessToken="t"
          src="https://example.org"
          title="I-SAW"
        />
      </HashRouter>
    );
    expect(screen.queryByRole('button', { name: 'Sign in' })).toBeNull();
  });
});
