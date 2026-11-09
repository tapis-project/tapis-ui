import React from 'react';
import { screen } from '@testing-library/react';
import renderComponent from 'testing/utils';
import { explorerFit } from 'app/_components/PageShell/viewPrefs';
import SystemFilesPanel from './SystemFilesPanel';

jest.mock('@tapis/tapisui-common', () => {
  const actual = jest.requireActual('@tapis/tapisui-common');
  return {
    ...actual,
    // the stub carries the className through, which is the whole point:
    // the fill chain only exists when the cap engaged
    FileListing: ({ className }: { className?: string }) => (
      <div data-testid="file-listing" className={className} />
    ),
    SystemProvider: ({ children }: React.PropsWithChildren<object>) => (
      <>{children}</>
    ),
  };
});
jest.mock('app/Files/_components/Toolbar/ToolbarV2', () => () => null);
jest.mock('app/Files/_components/FilesContext', () => ({
  FilesProvider: ({ children }: React.PropsWithChildren<object>) => (
    <>{children}</>
  ),
  useFilesSelect: () => ({
    select: jest.fn(),
    selectedFiles: [],
    unselect: jest.fn(),
    clear: jest.fn(),
  }),
}));
jest.mock('app/Files/_components/FilesBreadcrumbs', () => ({
  __esModule: true,
  default: () => null,
  useFilesNavigation: () => ({
    back: jest.fn(),
    top: jest.fn(),
    up: jest.fn(),
  }),
}));
jest.mock('app/Files/_components/useDropUpload', () => ({
  useDropUpload: () => ({ onDropFiles: jest.fn(), modal: null }),
}));

afterEach(() => explorerFit.reset());

describe('the system files panel and the explorer preference', () => {
  it('pins by default: the wrapper caps and the fill chain engages', () => {
    renderComponent(
      <SystemFilesPanel systemId="frontera" path="/" onGo={jest.fn()} />
    );
    const listing = screen.getByTestId('file-listing');
    // cap measured (jsdom: window fallback, innerHeight 768 − clearance)
    const wrapper = listing.closest('[data-pinned]');
    expect(wrapper).not.toBeNull();
    expect(listing).toHaveClass('listing-fill');
  });

  it('flows when the preference says so — no cap, no fill chain', () => {
    explorerFit.set('flow');
    renderComponent(
      <SystemFilesPanel systemId="frontera" path="/" onGo={jest.fn()} />
    );
    const listing = screen.getByTestId('file-listing');
    expect(listing.closest('[data-pinned]')).toBeNull();
    expect(listing).not.toHaveClass('listing-fill');
  });
});
