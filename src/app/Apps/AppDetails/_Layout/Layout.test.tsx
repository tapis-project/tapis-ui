/**
 * The app detail page's SHAPE, not its contents — the arrangement all three
 * detail pages share:
 *
 *   card 1  the app itself: who it is, what you can do to it (head line,
 *           top right), and the fact boxes inside it
 *   card 2  what it has been doing: the tiles and the runs table
 *   card 3  the record, when asked for — never instead of the other two
 *
 * The runs table is out of card 1 for the same reason the file explorer
 * sits below the system card — a wide table is not a fact box, and
 * squeezing it into a 340px grid cell is what forced it to be a
 * full-width slab in the first place.
 */
import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import renderComponent from 'testing/utils';
import { Apps as Hooks, useTapisConfig } from '@tapis/tapisui-hooks';
import Layout from './Layout';

jest.mock('@tapis/tapisui-hooks');
let mockJobs: any[] = [];
jest.mock('app/Jobs/_components/jobsSource', () => ({
  useJobsSource: () => ({ jobs: mockJobs }),
}));
// the head line's acts open real dialogs; this page's shape is the subject
jest.mock('app/Apps/_components/AppsToolbar/JobLaunchModal', () => () => (
  <div data-testid="launch-modal" />
));
jest.mock('app/Apps/_components/AppsToolbar/UpdateAppModal', () => () => (
  <div data-testid="update-modal" />
));
jest.mock('app/Apps/_components/AppsToolbar/CreateAppModal', () => () => (
  <div data-testid="create-modal" />
));
// the panels have their own tests; here they are just things that must
// land INSIDE the card
jest.mock('../_components/AppAccessPanel', () => () => (
  <div data-testid="access-panel" />
));
jest.mock('../_components/AppLifecyclePanel', () => () => (
  <div data-testid="lifecycle-panel" />
));
jest.mock('../_components/AppHistoryBox', () => () => (
  <div data-testid="history-box" />
));
// the cog's own menu has its own test; here it is just the press that has
// to land on the head line
jest.mock('../_components/AppSettingsCog', () => () => (
  <button type="button" aria-label="App settings" />
));

let undelete: jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  mockJobs = [];
  (useTapisConfig as jest.Mock).mockReturnValue({
    claims: { 'tapis/username': 'cgarcia' },
  });
  (Hooks.useDetail as jest.Mock).mockReturnValue({
    data: {
      result: {
        id: 'flexserv',
        version: '1.4.0',
        owner: 'cgarcia',
        enabled: true,
        uuid: 'app-uuid-1',
        jobAttributes: {},
      },
    },
    isLoading: false,
    error: null,
  });
  // the read that lets the page survive its own delete — empty by default,
  // so nothing here is deleted
  (Hooks.useDeletedApps as jest.Mock).mockReturnValue({
    data: undefined,
    isFetching: false,
    error: null,
  });
  undelete = jest.fn();
  (Hooks.useUndeleteApp as jest.Mock).mockReturnValue({
    undelete,
    isLoading: false,
    error: null,
  });
});

/** the line carrying the app's name — and, on its right, every action */
const theHeadLine = () =>
  screen.getByText('flexserv').closest('.MuiBox-root') as HTMLElement;
/** the card that line opens */
const theAppCard = () => theHeadLine().parentElement as HTMLElement;
/** the activity block: no card, no title of its own — the tiles and the
 *  runs table, found from the table's own title */
const theActivityBlock = () =>
  screen.getByText('Recent runs').closest('.MuiBox-root')?.parentElement
    ?.parentElement?.parentElement as HTMLElement;

describe('card one: the app', () => {
  it('holds the fact boxes', () => {
    renderComponent(<Layout appId="flexserv" appVersion="1.4.0" />);
    const card = theAppCard();
    expect(card).toBeTruthy();
    expect(card).toContainElement(screen.getByTestId('access-panel'));
    expect(card).toContainElement(screen.getByTestId('lifecycle-panel'));
    expect(card).toContainElement(screen.getByTestId('history-box'));
  });

  it('puts the acts, the record switch and the cog on the head line', () => {
    renderComponent(<Layout appId="flexserv" appVersion="1.4.0" />);
    const head = theHeadLine();
    expect(head).toContainElement(screen.getByText('submit job'));
    expect(head).toContainElement(screen.getByText('JSON'));
    expect(head).toContainElement(
      screen.getByRole('button', { name: 'App settings' })
    );
    // the owner is NOT here — the Sharing & access box answers that, and
    // saying it twice is what crowded this line in the first place
    expect(screen.queryByText('owner cgarcia')).toBeNull();
  });

  it('carries the app uuid, off the title line and copyable', () => {
    renderComponent(<Layout appId="flexserv" appVersion="1.4.0" />);
    expect(screen.getByText('app-uuid-1')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Copy App UUID' })
    ).toBeInTheDocument();
    // it is in the card, but NOT on the line with the name and the acts
    expect(theHeadLine()).not.toContainElement(screen.getByText('app-uuid-1'));
  });

  it('keeps the acts off the line, behind the cog', () => {
    // WHAT the cog offers is AppSettingsCog's own test; what matters here
    // is that none of it is sitting on the head line
    renderComponent(<Layout appId="flexserv" appVersion="1.4.0" />);
    expect(screen.queryByText('Update app')).toBeNull();
    expect(screen.queryByText('Disable')).toBeNull();
    expect(screen.queryByText('Delete')).toBeNull();
  });
});

describe('card two: what it has been doing', () => {
  it('keeps the runs table OUT of the app card', () => {
    renderComponent(<Layout appId="flexserv" appVersion="1.4.0" />);
    expect(theAppCard()).not.toContainElement(screen.getByText('Recent runs'));
  });

  it('shows the tiles and the runs table, below the app card', () => {
    renderComponent(<Layout appId="flexserv" appVersion="1.4.0" />);
    // the tiles — lower case, they are the tile's own label
    expect(screen.getByText('running now')).toBeInTheDocument();
    expect(screen.getByText('last run')).toBeInTheDocument();
    expect(screen.getByText('Recent runs')).toBeInTheDocument();
    // and none of it is INSIDE the app's card: this is the page's second
    // subject, not another of the app's fact boxes
    const card = theAppCard();
    expect(card).not.toContainElement(screen.getByText('running now'));
    expect(card).not.toContainElement(screen.getByText('Recent runs'));
  });

  it('wears no card and no title of its own', () => {
    renderComponent(<Layout appId="flexserv" appVersion="1.4.0" />);
    // the tiles carry their own labels and TableShell's strip says where
    // the rows come from — an outer frame was titling things that had
    // already named themselves
    expect(screen.queryByText('Activity')).toBeNull();
    expect(screen.queryByText('from the shared jobs window')).toBeNull();
  });
});

describe('card three: the record', () => {
  it('opens BELOW the page instead of replacing it', () => {
    renderComponent(<Layout appId="flexserv" appVersion="1.4.0" />);
    expect(screen.queryByText('App definition')).toBeNull();
    fireEvent.click(screen.getByText('JSON'));
    expect(screen.getByText('App definition')).toBeInTheDocument();
    // the page you were reading is still there — this was a tab that
    // swapped the overview out, and going back cost a second press
    expect(screen.getByTestId('access-panel')).toBeInTheDocument();
    expect(screen.getByText('Recent runs')).toBeInTheDocument();
    // the record is its own card, not part of the app's
    expect(theAppCard()).not.toContainElement(
      screen.getByText('App definition')
    );
  });

  it('shuts from its own close press as well as the head line', () => {
    renderComponent(<Layout appId="flexserv" appVersion="1.4.0" />);
    fireEvent.click(screen.getByText('JSON'));
    fireEvent.click(screen.getByText('close'));
    expect(screen.queryByText('App definition')).toBeNull();
  });
});

describe('surviving its own delete', () => {
  const NOT_FOUND = new Error(
    'APPAPI_NOT_FOUND Record not found. jwtTenant: tacc jwtUser: cgarcia ' +
      'OboTenant: tacc OboUser: cgarcia App: flexserv'
  );

  /** the single-app GET after a delete: it simply cannot see the record */
  const detailIs404 = () =>
    (Hooks.useDetail as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: NOT_FOUND,
    });

  const deletedListHas = (over: object = {}) =>
    (Hooks.useDeletedApps as jest.Mock).mockReturnValue({
      data: {
        result: [
          {
            id: 'flexserv',
            version: '1.4.0',
            owner: 'cgarcia',
            deleted: true,
            uuid: 'app-uuid-1',
            jobAttributes: {},
          },
        ],
      },
      isFetching: false,
      error: null,
      ...over,
    });

  it('renders the app from the deleted listing instead of the refusal', () => {
    detailIs404();
    deletedListHas();
    renderComponent(<Layout appId="flexserv" appVersion="1.4.0" />);
    // the page stands, so the Lifecycle box's restore press is reachable
    expect(screen.getByText('flexserv')).toBeInTheDocument();
    expect(screen.queryByText(/APPAPI_NOT_FOUND/)).toBeNull();
  });

  it('holds quiet in the gap before the deleted listing lands', () => {
    // delete succeeded, the detail read already 404s, the deleted listing
    // is still in flight — this beat used to flash the raw Tapis chain
    detailIs404();
    (Hooks.useDeletedApps as jest.Mock).mockReturnValue({
      data: undefined,
      isFetching: true,
      error: null,
    });
    renderComponent(<Layout appId="flexserv" appVersion="1.4.0" />);
    expect(screen.queryByText(/APPAPI_NOT_FOUND/)).toBeNull();
  });

  it('lets the deleted listing outvote a stale live record', () => {
    // right after the delete the detail query still holds what it fetched
    // while the app lived; "stale but present" must not win
    deletedListHas();
    renderComponent(<Layout appId="flexserv" appVersion="1.4.0" />);
    expect(screen.getByText('flexserv')).toBeInTheDocument();
  });

  it('still shows a real refusal that is not about deletion', () => {
    (Hooks.useDetail as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('APPAPI_SELECT_ERROR the service fell over'),
    });
    renderComponent(<Layout appId="flexserv" appVersion="1.4.0" />);
    expect(screen.getByText(/fell over/)).toBeInTheDocument();
  });

  it('wears the strip that says so, with the way back on it', () => {
    detailIs404();
    deletedListHas();
    renderComponent(<Layout appId="flexserv" appVersion="1.4.0" />);
    // the page reads from a different source with most doors shut, so it
    // says that rather than looking like an app that quietly stopped
    expect(screen.getByText('This app is deleted')).toBeInTheDocument();
    expect(
      screen.getByText(/appears in no listing and launches no jobs/)
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Restore/ }));
    expect(undelete).toHaveBeenCalledWith({ appId: 'flexserv' });
  });

  it('says nothing of the sort about a living app', () => {
    renderComponent(<Layout appId="flexserv" appVersion="1.4.0" />);
    expect(screen.queryByText('This app is deleted')).toBeNull();
    expect(screen.queryByRole('button', { name: /Restore/ })).toBeNull();
  });
});

describe('the runs table reads a verdict, not the last transition', () => {
  const HOUR = 60 * 60 * 1000;
  const run = (over: object = {}) => ({
    uuid: 'j-1',
    name: 'a-run',
    appId: 'flexserv',
    created: new Date(Date.now() - 2 * HOUR).toISOString(),
    remoteStarted: new Date(Date.now() - 2 * HOUR).toISOString(),
    ended: new Date(Date.now() - HOUR).toISOString(),
    status: 'FINISHED',
    condition: 'NORMAL_COMPLETION',
    ...over,
  });

  const chipFor = (word: string) =>
    screen.getByText(word).closest('.MuiChip-root') as HTMLElement;

  it('does not alarm over a session the user cancelled on purpose', () => {
    // the case the old table got wrong twice over: a red exclamation fired
    // on any condition but NORMAL_COMPLETION, and the chip printed
    // CANCELLED in alarm colours. An hour of real work had happened.
    mockJobs = [run({ status: 'CANCELLED', condition: 'CANCELLED_BY_USER' })];
    renderComponent(<Layout appId="flexserv" appVersion="1.4.0" />);
    expect(screen.queryByTestId('PriorityHighRoundedIcon')).toBeNull();
    // it reads as what happened, not as the last transition's name
    expect(screen.getByText('worked')).toBeInTheDocument();
    expect(chipFor('worked')).toHaveStyle({ color: '#37474f' });
    // and the service's own word is not shouted by default
    expect(screen.queryByText('CANCELLED')).toBeNull();
  });

  it('still reads a job that never got off the ground as trouble', () => {
    mockJobs = [
      run({
        status: 'FAILED',
        condition: 'JOB_UNABLE_TO_STAGE_INPUTS',
        remoteStarted: undefined,
      }),
    ];
    renderComponent(<Layout appId="flexserv" appVersion="1.4.0" />);
    expect(chipFor('never ran')).toHaveStyle({ color: '#c62828' });
    // and it says so where the runtime would be, rather than leaving a hole
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('keeps the raw status one column press away', () => {
    mockJobs = [run({ status: 'CANCELLED', condition: 'CANCELLED_BY_USER' })];
    renderComponent(<Layout appId="flexserv" appVersion="1.4.0" />);
    fireEvent.click(screen.getByLabelText('Choose columns'));
    fireEvent.click(screen.getByText('Status (raw)'));
    // the literal record, for anyone who wants it
    expect(screen.getByText('CANCELLED')).toBeInTheDocument();
    // and the reading stays beside it rather than being replaced
    expect(screen.getByText('worked')).toBeInTheDocument();
  });

  it('wears the same furniture as every other landing table', () => {
    mockJobs = [run()];
    renderComponent(<Layout appId="flexserv" appVersion="1.4.0" />);
    expect(screen.getByLabelText('Choose columns')).toBeInTheDocument();
    expect(screen.getByLabelText('Toggle row density')).toBeInTheDocument();
    expect(screen.getByLabelText('About this table')).toBeInTheDocument();
    // the provenance line along the bottom, which it had as a loose caption
    expect(screen.getByText(/Window: the last 1 jobs/)).toBeInTheDocument();
  });

  it('sorts on a header press, like every other table', () => {
    mockJobs = [
      run({ uuid: 'j-1', name: 'zulu' }),
      run({ uuid: 'j-2', name: 'alpha' }),
    ];
    renderComponent(<Layout appId="flexserv" appVersion="1.4.0" />);
    const namesInOrder = () =>
      screen.getAllByText(/^(zulu|alpha)$/).map((el) => el.textContent);
    fireEvent.click(screen.getByRole('button', { name: 'Sort by Job' }));
    expect(namesInOrder()).toEqual(['alpha', 'zulu']);
    fireEvent.click(screen.getByRole('button', { name: 'Sort by Job' }));
    expect(namesInOrder()).toEqual(['zulu', 'alpha']);
  });
});
