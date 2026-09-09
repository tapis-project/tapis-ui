import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import renderComponent from 'testing/utils';
import { Apps, Systems } from '@tapis/tapis-typescript';
import {
  Apps as AppsHooks,
  Jobs as JobsHooks,
  Systems as SystemsHooks,
} from '@tapis/tapisui-hooks';
import JobLauncherV2Dialog from '../JobLauncherV2Dialog';

jest.mock('@tapis/tapisui-hooks');

const system = {
  id: 'frontera',
  canRunBatch: true,
  batchDefaultLogicalQueue: 'normal',
  batchLogicalQueues: [{ name: 'normal', hpcQueueName: 'normal' }],
} as Systems.TapisSystem;

const app = {
  id: 'flexserv',
  version: '1.4.0',
  jobType: Apps.JobTypeEnum.Batch,
  jobAttributes: { execSystemId: 'frontera' },
} as Apps.TapisApp;

beforeEach(() => {
  jest.clearAllMocks();
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
  (JobsHooks.useSubmit as jest.Mock).mockReturnValue({
    submit: jest.fn(),
    isLoading: false,
    isSuccess: false,
    error: null,
    data: undefined,
    reset: jest.fn(),
  });
});

const closeButton = () =>
  screen.getByRole('button', { name: /close/i }) as HTMLElement;

describe('JobLauncherV2Dialog close guard', () => {
  it('closes without ceremony when nothing has been typed', () => {
    const onClose = jest.fn();
    renderComponent(
      <JobLauncherV2Dialog
        appId="flexserv"
        appVersion="1.4.0"
        onClose={onClose}
      />
    );
    fireEvent.click(closeButton());
    expect(onClose).toHaveBeenCalled();
    expect(
      screen.queryByText('Discard this job setup?')
    ).not.toBeInTheDocument();
  });

  it('asks once before throwing away work in progress', async () => {
    const onClose = jest.fn();
    renderComponent(
      <JobLauncherV2Dialog
        appId="flexserv"
        appVersion="1.4.0"
        onClose={onClose}
      />
    );

    const name = screen.getByLabelText(/^Name/);
    fireEvent.change(name, { target: { value: 'my-run' } });

    fireEvent.click(closeButton());
    expect(onClose).not.toHaveBeenCalled();
    expect(
      await screen.findByText('Discard this job setup?')
    ).toBeInTheDocument();

    // backing out leaves everything where it was
    fireEvent.click(screen.getByRole('button', { name: 'Keep editing' }));
    expect(onClose).not.toHaveBeenCalled();
    // the confirm animates out, and until it has, MUI keeps the launcher
    // behind it aria-hidden
    await waitFor(() =>
      expect(
        screen.queryByText('Discard this job setup?')
      ).not.toBeInTheDocument()
    );

    fireEvent.click(closeButton());
    fireEvent.click(await screen.findByRole('button', { name: 'Discard' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
