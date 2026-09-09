import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import renderComponent from 'testing/utils';
import { Jobs } from '@tapis/tapis-typescript';
import ResubmitDialog from './ResubmitDialog';

const job = {
  uuid: 'b1e2-c3d4',
  name: 'SleepSeconds',
  condition: 'NORMAL_COMPLETION',
  execSystemId: 'frontera',
} as unknown as Jobs.Job;

const render = (
  overrides: Partial<Jobs.Job> = {},
  onResubmit: () => void = jest.fn()
) =>
  renderComponent(
    <ResubmitDialog
      open
      onClose={jest.fn()}
      job={{ ...job, ...overrides }}
      onResubmit={onResubmit}
    />
  );

describe('ResubmitDialog', () => {
  it('says what the endpoint actually does, then does it', () => {
    const onResubmit = jest.fn();
    render({}, onResubmit);
    // the sentence that answers "can I edit before resubmitting?" — no
    expect(
      screen.getByText(/nothing about it can be changed on this path/)
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Resubmit as it was/ }));
    expect(onResubmit).toHaveBeenCalledTimes(1);
  });

  it('holds the flight in view instead of closing into dead air', () => {
    renderComponent(
      <ResubmitDialog
        open
        onClose={jest.fn()}
        job={job}
        onResubmit={jest.fn()}
        busy
      />
    );
    expect(screen.getByText('Submitting…')).toBeInTheDocument();
    expect(
      screen.getByText(/handing the definition to the scheduler/)
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Submitting/ })).toBeDisabled();
  });

  it('says a refused flight right where the press happened', () => {
    renderComponent(
      <ResubmitDialog
        open
        onClose={jest.fn()}
        job={job}
        onResubmit={jest.fn()}
        error={new Error('JOBS_QUOTA_EXCEEDED too many active jobs')}
      />
    );
    expect(screen.getByText(/resubmission was refused/)).toBeInTheDocument();
    expect(screen.getByText(/too many active jobs/)).toBeInTheDocument();
  });

  it('opens the launcher for adjust-first, saying it submits a new job', () => {
    const onAdjust = jest.fn();
    renderComponent(
      <ResubmitDialog
        open
        onClose={jest.fn()}
        job={job}
        onResubmit={jest.fn()}
        onAdjust={onAdjust}
      />
    );
    expect(screen.getByText('Adjust before running')).toBeInTheDocument();
    // the honesty is stated before the press: fresh submission, no old dirs
    expect(screen.getByText(/submits a new job/)).toBeInTheDocument();
    expect(screen.getByText(/not carried over/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Open in launcher/ }));
    expect(onAdjust).toHaveBeenCalledTimes(1);
  });

  it('keeps adjust-first visible but dead when no host wired it', () => {
    render();
    expect(
      screen.getByRole('button', { name: /Open in launcher/ })
    ).toBeDisabled();
  });

  it('tells a running job that resubmit means a second, independent run', () => {
    render({ status: 'RUNNING' as never });
    expect(screen.getByText(/second, independent run/)).toBeInTheDocument();
    // a finished job needs no such caveat
  });

  it('stays quiet about second runs when the job is over', () => {
    render({ status: 'FINISHED' as never });
    expect(screen.queryByText(/second, independent run/)).toBeNull();
  });

  it('warns when an unchanged resubmission is known to bounce', () => {
    render({
      condition: 'JOB_REMOTE_SUBMIT_FAILED' as never,
      lastMessage:
        'ERROR: You have multiple projects to charge to\n' +
        'Note that your available projects are:\nCTS21005\nOTH21077',
    });
    expect(screen.getByText(/refused the same way/)).toBeInTheDocument();
    expect(screen.getByText(/CTS21005, OTH21077/)).toBeInTheDocument();
  });

  it('stays quiet about projects on an ordinary failure', () => {
    render({
      condition: 'JOB_EXECUTION_FAILED' as never,
      lastMessage: 'the node ran out of walltime',
    });
    expect(screen.queryByText(/refused the same way/)).toBeNull();
  });
});
