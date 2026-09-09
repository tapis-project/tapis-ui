/**
 * The job page's cog. The card is stubbed to render just the cog it was
 * handed, so this is about the menu's contents and its presses — not about
 * how the card draws around them.
 */
import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import renderComponent from 'testing/utils';
import { Jobs as Hooks } from '@tapis/tapisui-hooks';
import JobDetail from './JobDetail';

jest.mock('@tapis/tapisui-hooks');
jest.mock('@tapis/tapisui-common', () => {
  const actual = jest.requireActual('@tapis/tapisui-common');
  return {
    ...actual,
    FileListing: () => null,
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
jest.mock('./ResubmitDialog', () => () => null);
jest.mock('app/Apps/JobLauncherV2/_components/seed', () => ({
  jobToSeed: () => ({}),
}));
// the card renders only the cog it was handed — the menu is the subject
jest.mock('./JobSummaryCard', () => ({ cog }: { cog: React.ReactNode }) => (
  <div data-testid="card">{cog}</div>
));

const job = (over: object = {}) => ({
  uuid: 'u-1',
  name: 'alpha-run',
  status: 'FINISHED',
  condition: 'NORMAL_COMPLETION',
  appId: 'flexserv',
  appVersion: '1.0',
  execSystemId: 'frontera',
  created: new Date().toISOString(),
  ...over,
});

let hideJob: jest.Mock;
let unhideJob: jest.Mock;
let refetch: jest.Mock;

const mountWith = (over: object = {}) => {
  refetch = jest.fn();
  (Hooks.useDetails as jest.Mock).mockReturnValue({
    data: { result: job(over) },
    isLoading: false,
    error: null,
    refetch,
  });
  renderComponent(<JobDetail jobUuid="u-1" />);
  fireEvent.click(screen.getByRole('button', { name: 'Job settings' }));
};

beforeEach(() => {
  jest.clearAllMocks();
  hideJob = jest.fn();
  unhideJob = jest.fn();
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
    hideJob,
    isLoading: false,
  });
  (Hooks.useUnhideJob as jest.Mock).mockReturnValue({
    unhideJob,
    isLoading: false,
  });
});

describe('what the job cog offers', () => {
  it('carries the run-again act', () => {
    mountWith();
    expect(screen.getByText('Resubmit')).toBeInTheDocument();
  });

  it('offers ONE way to run it again, not two', () => {
    // the dialog behind Resubmit shows what would be re-run and offers
    // 'Adjust before running' itself — a second entry straight to the
    // launcher was the same act with less information in front of it
    mountWith();
    expect(screen.queryByText('Resubmit with changes…')).toBeNull();
  });

  it('leaves hiding to the Lifecycle box', () => {
    // a switch whose position can only be read by opening the menu that
    // sets it is a switch nobody can see — and a menu row cannot ask first
    mountWith();
    expect(screen.queryByText('Hide job')).toBeNull();
    mountWith({ visible: false });
    expect(screen.queryByText('Unhide job')).toBeNull();
  });
});

describe('polling', () => {
  const intervalFor = (over: object = {}) => {
    mountWith(over);
    const options = (Hooks.useDetails as jest.Mock).mock.calls[0][1];
    // react-query hands the current data to the function form
    return options.refetchInterval({ result: job(over) });
  };

  it('stops entirely once the job can no longer change', () => {
    // it used to settle at whatever backoff it had reached and keep
    // asking for the whole record forever
    expect(intervalFor({ status: 'FINISHED' })).toBe(false);
    expect(intervalFor({ status: 'FAILED' })).toBe(false);
    expect(intervalFor({ status: 'CANCELLED' })).toBe(false);
  });

  it('keeps watching a run that is still going', () => {
    expect(intervalFor({ status: 'RUNNING' })).toBeGreaterThan(0);
    expect(intervalFor({ status: 'QUEUED' })).toBeGreaterThan(0);
  });
});

describe('hiding', () => {
  it('is not driven from this page at all any more', () => {
    // the page no longer holds the mutation: the Lifecycle box owns it,
    // beside the state it changes (see JobLifecyclePanel.test)
    mountWith();
    expect(hideJob).not.toHaveBeenCalled();
    expect(unhideJob).not.toHaveBeenCalled();
  });
});
