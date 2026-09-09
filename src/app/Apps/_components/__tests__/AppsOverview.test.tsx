import React from 'react';
import { act, screen } from '@testing-library/react';
import renderComponent from 'testing/utils';
import { Apps as Hooks, Jobs as JobsHooks } from '@tapis/tapisui-hooks';
import AppsOverview from '../AppsOverview';
import { setAppsSearch } from '../appsSearch';

jest.mock('@tapis/tapisui-hooks');

const apps = [
  {
    id: 'flexserv',
    version: '1.4.0',
    owner: 'cgarcia',
    runtime: 'SINGULARITY',
  },
  { id: 'yolo-finetune', version: '0.2', owner: 'cgarcia', runtime: 'ZIP' },
  { id: 'quiet-app', version: '1.0', owner: 'someone', runtime: 'DOCKER' },
];

const jobs = [
  { uuid: 'j1', appId: 'flexserv', status: 'FAILED', created: new Date() },
  { uuid: 'j2', appId: 'flexserv', status: 'FINISHED', created: new Date() },
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
  setAppsSearch('');
  (Hooks.useList as jest.Mock).mockReturnValue({
    data: { result: apps },
    isLoading: false,
    error: null,
  });
  (JobsHooks.useList as jest.Mock).mockReturnValue({
    data: { result: jobs },
    isLoading: false,
    error: null,
  });
  (Hooks.useListWindow as jest.Mock).mockReturnValue(windowOf(apps));
  (JobsHooks.useListWindow as jest.Mock).mockReturnValue(windowOf(jobs));
});

describe('AppsOverview table', () => {
  it('lists every app with a plain run count', () => {
    renderComponent(<AppsOverview />);
    expect(screen.getByText('flexserv')).toBeInTheDocument();
    expect(screen.getByText('quiet-app')).toBeInTheDocument();
    // two runs, and no mention of the one that failed — the landing is for
    // finding an app, not for scoring it
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.queryByText(/failed share/)).not.toBeInTheDocument();
  });

  it('shows a dash for an app with nothing in range', () => {
    renderComponent(<AppsOverview />);
    // quiet-app has no jobs: dashes rather than a zero that looks like a score
    expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(2);
  });

  it('drops the "not run recently" tile', () => {
    renderComponent(<AppsOverview />);
    expect(screen.getByText('run recently')).toBeInTheDocument();
    expect(screen.queryByText('not run recently')).not.toBeInTheDocument();
  });

  it('follows the nav search box', () => {
    renderComponent(<AppsOverview />);
    act(() => setAppsSearch('yolo'));
    expect(screen.getByText('yolo-finetune')).toBeInTheDocument();
    expect(screen.queryByText('flexserv')).not.toBeInTheDocument();
  });
});
