import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import renderComponent from 'testing/utils';
import { Apps, Systems } from '@tapis/tapis-typescript';
import {
  Apps as AppsHooks,
  Jobs as JobsHooks,
  Systems as SystemsHooks,
} from '@tapis/tapisui-hooks';
import JobLaunchModal from './JobLaunchModal';

jest.mock('@tapis/tapisui-hooks');

const app = {
  id: 'flexserv',
  version: '1.4.0',
  jobType: Apps.JobTypeEnum.Batch,
  jobAttributes: { execSystemId: 'frontera' },
} as Apps.TapisApp;

const system = {
  id: 'frontera',
  canRunBatch: true,
  batchDefaultLogicalQueue: 'normal',
  batchLogicalQueues: [{ name: 'normal', hpcQueueName: 'normal' }],
} as Systems.TapisSystem;

beforeEach(() => {
  jest.clearAllMocks();
  (JobsHooks.useSubmit as jest.Mock).mockReturnValue({
    submit: jest.fn(),
    isLoading: false,
    isSuccess: false,
    error: null,
    reset: jest.fn(),
  });
  (AppsHooks.useDetail as jest.Mock).mockReturnValue({
    data: { result: app },
    isLoading: false,
    error: null,
  });
  (SystemsHooks.useList as jest.Mock).mockReturnValue({
    data: { result: [system] },
    isLoading: false,
    error: null,
  });
  (SystemsHooks.useSchedulerProfiles as jest.Mock).mockReturnValue({
    data: { result: [] },
    isLoading: false,
    error: null,
  });
});

describe('JobLaunchModal', () => {
  it('offers the three launch paths', () => {
    renderComponent(<JobLaunchModal app={app} toggle={jest.fn()} />);
    expect(screen.getByText('Guided job launcher (v2)')).toBeInTheDocument();
    expect(
      screen.getByText('Use guided job launcher (v1)')
    ).toBeInTheDocument();
    expect(screen.getByText('Submit with JSON')).toBeInTheDocument();
  });

  it('sends the JSON choice straight to the launcher on its JSON pane', async () => {
    renderComponent(<JobLaunchModal app={app} toggle={jest.fn()} />);
    fireEvent.click(screen.getByText('Submit with JSON'));

    expect(screen.getAllByRole('dialog')).toHaveLength(1);
    expect(screen.getByText('Launch job')).toBeInTheDocument();
    // straight into the editor, not the preview
    expect(await screen.findByText(/Paste a job here/)).toBeInTheDocument();
  });

  it('replaces itself with the v2 panel — one dialog, no second title bar', () => {
    renderComponent(<JobLaunchModal app={app} toggle={jest.fn()} />);
    fireEvent.click(screen.getByText('Guided job launcher (v2)'));

    expect(screen.getAllByRole('dialog')).toHaveLength(1);
    // the chooser's own chrome is gone; the panel's header takes over, and it
    // routes to Review rather than carrying a second title bar
    expect(
      screen.queryByRole('heading', { name: 'Submit Job' })
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Review & submit/ })
    ).toBeInTheDocument();
    expect(screen.getByText('Launch job')).toBeInTheDocument();
    // panel caption + the Basics section's app chip
    expect(screen.getAllByText('flexserv v1.4.0').length).toBeGreaterThan(0);
  });
});
