import React from 'react';
import { fireEvent, screen, within } from '@testing-library/react';
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

  it('makes the launcher we keep the obvious press', () => {
    renderComponent(<JobLaunchModal app={app} toggle={jest.fn()} />);
    const buttonFor = (text: string) =>
      screen.getByText(text).closest('button') as HTMLElement;

    // three identical outlined buttons said these were three equal choices,
    // which is not what we think: v2 is the launcher we keep
    expect(buttonFor('Guided job launcher (v2)').className).toMatch(
      /MuiButton-contained/
    );
    expect(buttonFor('Use guided job launcher (v1)').className).not.toMatch(
      /MuiButton-contained/
    );
    expect(buttonFor('Submit with JSON').className).not.toMatch(
      /MuiButton-contained/
    );
    // same button as the other two, though: this is a filled press, not a
    // bigger one
    expect(buttonFor('Guided job launcher (v2)').className).toMatch(
      /MuiButton-sizeLarge/
    );
  });

  it('sends the JSON choice straight to the launcher, its JSON editor open', async () => {
    renderComponent(<JobLaunchModal app={app} toggle={jest.fn()} />);
    fireEvent.click(screen.getByText('Submit with JSON'));

    // the chooser replaced itself with the launcher rather than nesting it
    expect(screen.queryByText('Submit with JSON')).not.toBeInTheDocument();
    expect(screen.getByText('Launch job')).toBeInTheDocument();
    // straight into the editor, not the preview: its own dialog over the
    // launcher, which stays underneath with the steps
    expect(
      await screen.findByRole('dialog', { name: 'Edit the job as JSON' })
    ).toBeInTheDocument();
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
    // the pager's press: the nav row goes by the same name now
    expect(
      within(screen.getByRole('group', { name: 'Step navigation' })).getByRole(
        'button',
        { name: /Review & Submit/ }
      )
    ).toBeInTheDocument();
    expect(screen.getByText('Launch job')).toBeInTheDocument();
    // panel caption + the Basics section's app chip
    expect(screen.getAllByText('flexserv v1.4.0').length).toBeGreaterThan(0);
  });
});
