import React from 'react';
import { act } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import renderComponent from 'testing/utils';
import LoginDialog from './LoginDialog';

jest.mock('extensions', () => ({
  useExtension: () => ({ extension: undefined, extensionName: undefined }),
}));

// The form itself has its own suite; here it only has to be there or not.
jest.mock('../Login', () => () => <div>the form</div>);

// Signed in or not is the one thing these tests vary.
let mockSignedIn = false;
jest.mock('@tapis/tapisui-hooks', () => ({
  useTapisConfig: () => ({
    basePath: 'https://tacc.develop.tapis.io',
    accessToken: mockSignedIn ? { access_token: 'token' } : undefined,
    claims: mockSignedIn ? { 'tapis/username': 'testuser' } : {},
  }),
}));

describe('LoginDialog', () => {
  beforeEach(() => {
    mockSignedIn = false;
  });

  it('names where the sign-in leads, with the full page one press away', () => {
    const { getByText } = renderComponent(
      <LoginDialog open onClose={() => {}} fromPathname="/ai-hub" />
    );
    expect(getByText(/AI Hub requires sign-in/)).toBeDefined();
    expect(getByText('Sign in')).toBeDefined();
    expect(getByText('Open the full login page')).toBeDefined();
  });

  // The beat swaps words in the same blocks, so the dialog doesn't jump: the
  // card title says who signed in, the link row says where to.
  it('says who signed in and where it is going, then goes there', () => {
    jest.useFakeTimers();
    mockSignedIn = true;
    const history = createMemoryHistory({ initialEntries: ['/'] });
    const { getByRole, getByText, queryByText } = renderComponent(
      <LoginDialog open onClose={() => {}} fromPathname="/ai-hub" />,
      history
    );
    expect(getByRole('status').textContent).toContain('Signed in as testuser');
    expect(getByText('Opening AI Hub…')).toBeDefined();
    expect(queryByText('Open the full login page')).toBeNull();
    expect(queryByText('Sign in')).toBeNull();
    act(() => {
      jest.advanceTimersByTime(1200);
    });
    expect(history.location.pathname).toBe('/ai-hub');
    jest.useRealTimers();
  });

  it('returns to the page with its query string', () => {
    jest.useFakeTimers();
    mockSignedIn = true;
    const history = createMemoryHistory({ initialEntries: ['/'] });
    renderComponent(
      <LoginDialog
        open
        onClose={() => {}}
        fromPathname="/isaw"
        fromSearch="?view=map"
      />,
      history
    );
    act(() => {
      jest.advanceTimersByTime(1200);
    });
    expect(history.location.pathname).toBe('/isaw');
    expect(history.location.search).toBe('?view=map');
    jest.useRealTimers();
  });
});
