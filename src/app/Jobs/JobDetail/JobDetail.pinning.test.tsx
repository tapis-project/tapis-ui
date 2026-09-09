/**
 * The job page's output browser and the explorer preference — a wiring
 * test, born of a session where the browser said "not pinned" and the
 * code read fine: render the REAL JobDetail (heavies stubbed) and assert
 * the cap actually engages around the listing.
 */
import React from 'react';
import { screen } from '@testing-library/react';
import renderComponent from 'testing/utils';
import { Jobs as Hooks } from '@tapis/tapisui-hooks';
import { explorerFit } from 'app/_components/PageShell/viewPrefs';
import JobDetail from './JobDetail';

jest.mock('@tapis/tapisui-hooks');
jest.mock('@tapis/tapisui-common', () => {
  const actual = jest.requireActual('@tapis/tapisui-common');
  return {
    ...actual,
    FileListing: ({ className }: { className?: string }) => (
      <div data-testid="file-listing" className={className} />
    ),
    SystemProvider: ({ children }: React.PropsWithChildren<object>) => (
      <>{children}</>
    ),
    JSONDisplay: () => null,
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
jest.mock('app/_components/NavSpine', () => ({
  useSpineWriter: () => jest.fn(),
}));
jest.mock('../_components/JobsLayoutToolbar/CancelledJobsContext', () => ({
  useCancelledJobs: () => ({
    cancelledUuids: new Set(),
    markCancelled: jest.fn(),
    unmarkCancelled: jest.fn(),
  }),
}));
jest.mock('../_components/SessionCard', () => () => null);
jest.mock('./JobSummaryCard', () => () => null);
jest.mock('./ResubmitDialog', () => () => null);
jest.mock('app/Apps/JobLauncherV2/_components/seed', () => ({
  jobToSeed: () => ({}),
}));

const job = {
  uuid: 'u-1',
  name: 'alpha-run',
  status: 'FINISHED',
  condition: 'NORMAL_COMPLETION',
  appId: 'flexserv',
  appVersion: '1.0',
  execSystemId: 'frontera',
  execSystemOutputDir: '/out',
  created: new Date().toISOString(),
};

beforeEach(() => {
  jest.clearAllMocks();
  (Hooks.useDetails as jest.Mock).mockReturnValue({
    data: { result: job },
    isLoading: false,
    error: null,
  });
  (Hooks.useResubmit as jest.Mock).mockReturnValue({
    resubmit: jest.fn(),
    isLoading: false,
    error: null,
  });
  (Hooks.useCancel as jest.Mock).mockReturnValue({
    cancel: jest.fn(),
    isLoading: false,
    isSuccess: false,
    reset: jest.fn(),
  });
  (Hooks.useHideJob as jest.Mock).mockReturnValue({
    hideJob: jest.fn(),
    isLoading: false,
  });
  (Hooks.useUnhideJob as jest.Mock).mockReturnValue({
    unhideJob: jest.fn(),
    isLoading: false,
  });
});

afterEach(() => explorerFit.reset());

describe('the job output browser and the explorer preference', () => {
  it('pins by default: the wrapper caps and the fill chain engages', () => {
    renderComponent(<JobDetail jobUuid="u-1" />);
    const listing = screen.getByTestId('file-listing');
    expect(listing.closest('[data-pinned]')).not.toBeNull();
    expect(listing).toHaveClass('listing-fill');
  });

  it('flows when the preference says so — no cap, no fill chain', () => {
    explorerFit.set('flow');
    renderComponent(<JobDetail jobUuid="u-1" />);
    const listing = screen.getByTestId('file-listing');
    expect(listing.closest('[data-pinned]')).toBeNull();
    expect(listing).not.toHaveClass('listing-fill');
  });
});
