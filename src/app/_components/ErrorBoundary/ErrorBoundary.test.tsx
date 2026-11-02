import React from 'react';
import { render, screen } from '@testing-library/react';
import ErrorBoundary, { isChunkError, reloadForNewBuild } from '.';

const Boom: React.FC<{ message?: string }> = ({ message }) => {
  if (message) throw new Error(message);
  return <div>page body</div>;
};

describe('ErrorBoundary', () => {
  let consoleError: jest.SpyInstance;
  beforeEach(() => {
    consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    sessionStorage.clear();
  });
  afterEach(() => consoleError.mockRestore());

  it('shows the error instead of unmounting the app', () => {
    render(
      <ErrorBoundary>
        <Boom message="bad render" />
      </ErrorBoundary>
    );
    expect(screen.getByRole('alert')).toHaveTextContent('bad render');
    expect(screen.getByRole('button', { name: 'Reload' })).toBeInTheDocument();
  });

  it('names a failed chunk rather than printing the loader message', () => {
    render(
      <ErrorBoundary>
        <Boom message="Failed to fetch dynamically imported module: /a.js" />
      </ErrorBoundary>
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Page failed to load');
    expect(screen.queryByText(/a\.js/)).not.toBeInTheDocument();
  });

  it('recovers when the reset key changes', () => {
    const { rerender } = render(
      <ErrorBoundary resetKey="/a">
        <Boom message="bad render" />
      </ErrorBoundary>
    );
    rerender(
      <ErrorBoundary resetKey="/b">
        <Boom />
      </ErrorBoundary>
    );
    expect(screen.getByText('page body')).toBeInTheDocument();
  });
});

describe('reloadForNewBuild', () => {
  beforeEach(() => sessionStorage.clear());

  it('reloads once, then refuses inside the window', () => {
    const reload = jest.fn();
    expect(reloadForNewBuild(reload, 100_000)).toBe(true);
    expect(reloadForNewBuild(reload, 130_000)).toBe(false);
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it('reloads again once the window has passed', () => {
    const reload = jest.fn();
    reloadForNewBuild(reload, 100_000);
    expect(reloadForNewBuild(reload, 200_000)).toBe(true);
  });
});

describe('isChunkError', () => {
  it('matches the Chromium, Safari and Firefox wordings', () => {
    [
      'Failed to fetch dynamically imported module: https://x/a.js',
      'Importing a module script failed.',
      'error loading dynamically imported module',
      'Unable to preload CSS for /assets/a.css',
    ].forEach((m) => expect(isChunkError(new Error(m))).toBe(true));
  });

  it('leaves ordinary errors alone', () => {
    expect(isChunkError(new Error('x is undefined'))).toBe(false);
  });
});
