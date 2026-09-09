import React from 'react';
import { act, fireEvent, screen } from '@testing-library/react';
import renderComponent from 'testing/utils';
import { Jobs as Hooks } from '@tapis/tapisui-hooks';
import { useLocation } from 'react-router-dom';
import JobsDashboard from '../JobsDashboard';
import { setJobsSearch } from '../jobsSearch';

jest.mock('@tapis/tapisui-hooks');

const job = (over: any) => ({
  uuid: `u-${over.name}`,
  owner: 'cgarcia',
  appId: 'flexserv',
  appVersion: '1.4.0',
  execSystemId: 'frontera',
  status: 'FINISHED',
  condition: 'NORMAL_COMPLETION',
  created: new Date(),
  ...over,
});

const jobs = [
  job({ name: 'alpha-run' }),
  job({ name: 'beta-run', appId: 'yolo-finetune', execSystemId: 'vista' }),
  job({ name: 'gamma-run', owner: 'someone-else' }),
];

const windowOf = (items: any[]) => ({
  data: { pages: [{ items, total: items.length }] },
  isLoading: false,
  error: null,
  hasNextPage: false,
  isFetchingNextPage: false,
  fetchNextPage: jest.fn(),
});

beforeEach(() => {
  jest.clearAllMocks();
  setJobsSearch('');
  (Hooks.useList as jest.Mock).mockReturnValue({
    data: { result: jobs },
    isLoading: false,
    error: null,
  });
  (Hooks.useListWindow as jest.Mock).mockReturnValue(windowOf(jobs));
});

const Where: React.FC = () => <span>{`at ${useLocation().pathname}`}</span>;

describe('JobsDashboard table', () => {
  it('lists every job in the window', () => {
    renderComponent(<JobsDashboard />);
    expect(screen.getByText('alpha-run')).toBeInTheDocument();
    expect(screen.getByText('beta-run')).toBeInTheDocument();
    expect(screen.getByText('gamma-run')).toBeInTheDocument();
    // where the filter lives moved behind the ⓘ — the resting rail says
    // nothing, and the standing explanation waits to be asked
    expect(
      screen.queryByText('the nav search box filters this table too')
    ).toBeNull();
    expect(screen.getByLabelText('About this table')).toBeInTheDocument();
    expect(screen.getByLabelText('Choose columns')).toBeInTheDocument();
  });

  it('follows the nav search box', () => {
    renderComponent(<JobsDashboard />);
    act(() => setJobsSearch('yolo'));

    // matched on app id, not just the name — the same fields the nav searches
    expect(screen.getByText('beta-run')).toBeInTheDocument();
    expect(screen.queryByText('alpha-run')).not.toBeInTheDocument();
    expect(
      screen.getByText(/filtered by nav search: "yolo"/)
    ).toBeInTheDocument();
  });

  it('links the app and the exec system to their own pages', () => {
    renderComponent(
      <>
        <JobsDashboard />
        <Where />
      </>
    );

    // the per-app activity panel names apps too; the table's is the anchor —
    // a real one, so middle-click and cmd-click open a tab
    // the name sits in a span inside the anchor now — the anchor carries a
    // glyph beside it, which is what says it goes somewhere
    const appLink = screen
      .getAllByText('flexserv')
      .map((el) => el.closest('a'))
      .find(Boolean)!;
    expect(appLink).toHaveAttribute('href', '/#/apps/flexserv/1.4.0');
    fireEvent.click(appLink);
    expect(screen.getByText('at /apps/flexserv/1.4.0')).toBeInTheDocument();
  });

  it('does not let a cell link open the row it sits in', () => {
    renderComponent(
      <>
        <JobsDashboard />
        <Where />
      </>
    );

    fireEvent.click(screen.getAllByText('frontera')[0]);
    // the system, not the job the row would have opened
    expect(screen.getByText('at /systems/frontera')).toBeInTheDocument();
  });

  it('leaves a modified click to the browser, so it can open a tab', () => {
    renderComponent(
      <>
        <JobsDashboard />
        <Where />
      </>
    );
    const link = screen
      .getAllByText('frontera')
      .map((el) => el.closest('a'))
      .find(Boolean)!;

    // wherever the previous test left the router
    const before = screen.getByText(/^at /).textContent;
    fireEvent.click(link, { ctrlKey: true });
    // no SPA navigation: the anchor's href is what the browser acts on, and
    // the row underneath must not open either
    expect(screen.getByText(/^at /).textContent).toBe(before);
  });

  it('has dropped the failures and running panels', () => {
    renderComponent(<JobsDashboard />);
    expect(screen.queryByText(/Recent failures/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Running now/)).not.toBeInTheDocument();
  });

  it('says so when the search matches nothing', () => {
    renderComponent(<JobsDashboard />);
    act(() => setJobsSearch('nothing-like-this'));
    expect(screen.getByText(/Nothing matches/)).toBeInTheDocument();
    expect(screen.getByText(/Clear the nav search/)).toBeInTheDocument();
    // an empty result is not an empty account
    expect(screen.queryByText('No jobs yet.')).not.toBeInTheDocument();
  });
});

describe('a landing with nothing on it', () => {
  beforeEach(() => {
    (Hooks.useList as jest.Mock).mockReturnValue({
      data: { result: [] },
      isLoading: false,
      error: null,
    });
    (Hooks.useListWindow as jest.Mock).mockReturnValue(windowOf([]));
  });

  it('is still the page, with the message in the table', () => {
    // it used to replace the whole dashboard with a paragraph — a second
    // page for the least interesting state there is, hiding every control
    // that would have got you out of it
    renderComponent(<JobsDashboard />);
    expect(screen.getByText('No jobs yet.')).toBeInTheDocument();
    expect(screen.getByText(/A job is one run of an app/)).toBeInTheDocument();
    expect(screen.getByText('Job')).toBeInTheDocument();
  });

  it('counts the nothing rather than hiding the counters', () => {
    renderComponent(<JobsDashboard />);
    expect(screen.getByText('jobs')).toBeInTheDocument();
  });

  it('says nothing about mission logs', () => {
    renderComponent(<JobsDashboard />);
    expect(screen.queryByText(/mission log/i)).not.toBeInTheDocument();
  });
});
