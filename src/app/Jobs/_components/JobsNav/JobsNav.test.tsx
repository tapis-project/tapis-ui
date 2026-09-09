import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import renderComponent from 'testing/utils';
import JobsNavV2 from './JobsNavV2';
import { Jobs as Hooks } from '@tapis/tapisui-hooks';
import { jobInfo } from 'fixtures/jobs.fixtures';
import { jobGlyphStyle } from 'app/_components/PageShell/viewPrefs';

jest.mock('@tapis/tapisui-hooks');

const windowOf = (items: any[]) => ({
  data: { pages: [{ items, total: items.length }] },
  isLoading: false,
  error: null,
  hasNextPage: false,
  isFetchingNextPage: false,
  fetchNextPage: jest.fn(),
});

const mockList = (jobs: any[]) => {
  (Hooks.useList as jest.Mock).mockReturnValue({
    data: { result: jobs },
    isLoading: false,
    error: null,
  });
  (Hooks.useListWindow as jest.Mock).mockReturnValue(windowOf(jobs));
};

describe('JobsNavV2', () => {
  it('renders a job row', () => {
    mockList([jobInfo]);
    const { getAllByText } = renderComponent(<JobsNavV2 />);
    expect(getAllByText(/SleepSeconds/).length).toBeGreaterThanOrEqual(1);
  });

  it('filters to failed jobs from the quick chips, and back', () => {
    mockList([
      jobInfo,
      {
        ...jobInfo,
        uuid: 'failed-1',
        name: 'BrokenRun',
        // a distinct app too: the row's second line is the app id, so sharing
        // one would leave 'SleepSeconds' on screen after the filter
        appId: 'broken-app',
        status: 'FAILED',
      },
    ]);
    renderComponent(<JobsNavV2 />);

    // the bar is folded away until asked for
    expect(screen.queryByText('Quick')).not.toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('Filter'));

    expect(screen.getAllByText(/SleepSeconds/).length).toBeGreaterThan(0);
    fireEvent.click(screen.getByText('Failed'));
    expect(screen.getAllByText(/BrokenRun/).length).toBeGreaterThan(0);
    expect(screen.queryByText(/SleepSeconds/)).not.toBeInTheDocument();

    // the chip is the state: pressing the lit one puts everything back
    fireEvent.click(screen.getByText('Failed'));
    expect(screen.getAllByText(/SleepSeconds/).length).toBeGreaterThan(0);
  });

  it('puts the sort direction beside sort, in one cluster', () => {
    mockList([jobInfo]);
    renderComponent(<JobsNavV2 />);
    // the direction arrow used to sit on the far side of the groups switch,
    // away from the sort it belongs to
    const labels = ['Filter', 'Sort', 'Ascending', 'Descending', 'Group'];
    const order = Array.from(document.querySelectorAll('button[aria-label]'))
      .map((button) => button.getAttribute('aria-label') ?? '')
      .filter((label) => labels.includes(label))
      // the arrow names the direction it is in, which is not what is being
      // asserted here — only where it sits
      .map((label) =>
        label === 'Ascending' || label === 'Descending' ? 'Direction' : label
      );
    expect(order).toEqual(['Filter', 'Sort', 'Direction', 'Group']);
  });

  it('reverses the order from the arrow, and says which way it is', () => {
    mockList([jobInfo]);
    renderComponent(<JobsNavV2 />);
    fireEvent.click(screen.getByLabelText('Ascending'));
    expect(screen.getByLabelText('Descending')).toBeInTheDocument();
    expect(screen.queryByLabelText('Ascending')).not.toBeInTheDocument();
  });

  it('counts the filters that are on once the panel is folded away', () => {
    mockList([
      jobInfo,
      { ...jobInfo, uuid: 'f-1', name: 'Broken', status: 'FAILED' },
    ]);
    renderComponent(<JobsNavV2 />);

    const badge = () =>
      screen.getByLabelText('Filter').querySelector('.MuiBadge-badge')!;

    // nothing on: the count is there but scaled away, MUI's own zero state
    expect(badge().className).toContain('MuiBadge-invisible');

    fireEvent.click(screen.getByLabelText('Filter'));
    fireEvent.click(screen.getByText('Failed'));
    fireEvent.click(screen.getByLabelText('Filter'));

    // the panel is closed again, but the bar still admits the list is filtered
    expect(screen.queryByText('Quick')).not.toBeInTheDocument();
    expect(badge().className).not.toContain('MuiBadge-invisible');
    expect(badge().textContent).toBe('1');
  });

  it('says the status once — in the left icon, not as row text', () => {
    // the rebuilt glyph is the default: the icon names the VERDICT rather
    // than the raw status, which is the whole point of it
    mockList([jobInfo]);
    const { queryByText, getByLabelText } = renderComponent(<JobsNavV2 />);
    expect(queryByText('FINISHED')).not.toBeInTheDocument();
    expect(getByLabelText(/Finished normally/)).toBeInTheDocument();
  });

  it('names the raw status instead when the glyph is set to classic', () => {
    jobGlyphStyle.set('classic');
    mockList([jobInfo]);
    const { getByLabelText } = renderComponent(<JobsNavV2 />);
    expect(getByLabelText('FINISHED')).toBeInTheDocument();
    jobGlyphStyle.reset();
  });
});
