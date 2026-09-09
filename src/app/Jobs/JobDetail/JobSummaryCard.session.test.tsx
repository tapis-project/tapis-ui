/**
 * The session box lives in the card's mosaic, and the press that frames a
 * session is inside it. This is the composition test for that, mounted on
 * the real page because the fault lived in the wiring BETWEEN the page and
 * the box, not in either one alone — both passed their own tests while the
 * panel was unusable.
 *
 * The page used to lift the session box out of the mosaic when its frame
 * opened, on the theory that an embedded window needed the card's full
 * width. It does not: the frame is a fixed-position window with its own
 * remembered geometry. What the lift DID do was put the component under a
 * different parent, which React reads as a different component — unmount,
 * remount, and the fresh instance's `framed` is false. The panel opened and
 * shut itself in the same beat, and the card visibly reloaded on the way
 * past. Same for ParaView, and for every session app that tolerates a frame.
 */
import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import renderComponent from 'testing/utils';
import { Jobs as Hooks, useTapisConfig } from '@tapis/tapisui-hooks';
import JobDetail from './JobDetail';

const ADDRESS = 'https://vista.tacc.utexas.edu:60091';
const READY = `-- FlexServ address: ${ADDRESS}  FlexServ token: ddd`;

jest.mock('@tapis/tapisui-hooks');
// everything around the card that is not the subject: the listing, the
// file machinery it needs, the nav spine
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
jest.mock('./ResubmitDialog', () => () => null);
jest.mock('app/Apps/JobLauncherV2/_components/seed', () => ({
  jobToSeed: () => ({}),
}));

const job = {
  uuid: 'u-1',
  name: 'flexserv-run',
  status: 'RUNNING',
  jobType: 'BATCH',
  owner: 'cgarcia',
  tenant: 'tacc',
  appId: 'flexserv',
  appVersion: '0.0.1',
  execSystemId: 'frontera',
  created: new Date().toISOString(),
};

const idle = {
  data: undefined,
  isLoading: false,
  isFetching: false,
  isSuccess: false,
  isError: false,
  error: null,
};

const panel = () =>
  screen.queryByRole('dialog', { name: 'FlexServ session window' });

beforeEach(() => {
  jest.clearAllMocks();
  (Hooks.useDetails as jest.Mock).mockReturnValue({
    data: { result: job },
    isLoading: false,
    error: null,
    refetch: jest.fn(),
  });
  (Hooks.useHideJob as jest.Mock).mockReturnValue({
    hideJob: jest.fn(),
    isLoading: false,
  });
  (Hooks.useUnhideJob as jest.Mock).mockReturnValue({ unhideJob: jest.fn() });
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
  // the run has already announced itself, so the Panel press is there
  (Hooks.useGetJobOutputText as jest.Mock).mockImplementation(
    (_params: unknown, options: any) => {
      if (options?.enabled && options?.onSuccess) options.onSuccess(READY);
      return { ...idle, data: READY, isSuccess: true };
    }
  );
  (Hooks.useJobHistory as jest.Mock).mockReturnValue(idle);
  (Hooks.useJobShare as jest.Mock).mockReturnValue(idle);
  (Hooks.useShareJob as jest.Mock).mockReturnValue({
    share: jest.fn(),
    error: null,
  });
  (Hooks.useDeleteJobShare as jest.Mock).mockReturnValue({
    unshare: jest.fn(),
    error: null,
  });
  (useTapisConfig as jest.Mock).mockReturnValue({ claims: {} });
});

describe('the session panel, on the page', () => {
  it('stays open — framing a session does not move the box that framed it', async () => {
    renderComponent(<JobDetail jobUuid="u-1" />);

    fireEvent.click(await screen.findByRole('button', { name: /Panel/ }));

    // still up once the press's effects have run, which is where the page
    // used to relocate the box — and still up a beat later, after the
    // mosaic has had its chance to settle
    expect(panel()).toBeInTheDocument();
    await waitFor(() => expect(panel()).toBeInTheDocument());
    expect(
      (screen.getByTitle('FlexServ session') as HTMLIFrameElement).src
    ).toBe(`${ADDRESS}/`);
  });

  it('still closes on the press that closes it', async () => {
    renderComponent(<JobDetail jobUuid="u-1" />);
    fireEvent.click(await screen.findByRole('button', { name: /Panel/ }));
    fireEvent.click(screen.getByLabelText('Close session window'));
    expect(panel()).toBeNull();
  });
});
