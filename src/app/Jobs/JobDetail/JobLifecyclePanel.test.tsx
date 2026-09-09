/**
 * The Lifecycle box the job card was missing. Hiding lived only in the cog,
 * so the state could be read nowhere but the menu that set it — and a job
 * you had hidden looked exactly like one you had not.
 */
import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import renderComponent from 'testing/utils';
import { Jobs as Hooks, useTapisConfig } from '@tapis/tapisui-hooks';
import JobLifecyclePanel from './JobLifecyclePanel';

jest.mock('@tapis/tapisui-hooks');

const mutation = (over: object = {}) => ({
  isLoading: false,
  isSuccess: false,
  isError: false,
  error: null,
  data: undefined,
  reset: jest.fn(),
  ...over,
});

let hideJob: jest.Mock;
let unhideJob: jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  hideJob = jest.fn();
  unhideJob = jest.fn();
  (Hooks.useHideJob as jest.Mock).mockReturnValue(mutation({ hideJob }));
  (Hooks.useUnhideJob as jest.Mock).mockReturnValue(mutation({ unhideJob }));
  (useTapisConfig as jest.Mock).mockReturnValue({
    claims: { 'tapis/username': 'cgarcia' },
  });
});

const job = (over: object = {}) => ({
  uuid: 'u-1',
  owner: 'cgarcia',
  status: 'FINISHED',
  ...over,
});

describe('what the box says', () => {
  it('reads the resting state — listed, and the ending needs no gloss', () => {
    renderComponent(<JobLifecyclePanel job={job()} />);
    expect(screen.getByText('listed')).toBeInTheDocument();
    // FINISHED already says it; there is nothing to add
    expect(screen.getByText('FINISHED')).toBeInTheDocument();
    expect(screen.queryByText(/^·/)).toBeNull();
  });

  it('says how a hidden job is actually reached', () => {
    renderComponent(<JobLifecyclePanel job={job({ visible: false })} />);
    // not merely "out of the listings": verified against the service, a
    // hidden job is filtered out of the list AND of search, so the link is
    // genuinely the only way in and this box the only way out
    expect(
      screen.getByText(/hidden: reachable only by its link/)
    ).toBeInTheDocument();
  });

  it('does not offer to stop a job from in here', () => {
    // stopping is time-critical and lives on the head line as the page's
    // one visible button; a second copy in a box is not where anyone looks
    renderComponent(<JobLifecyclePanel job={job({ status: 'RUNNING' })} />);
    expect(screen.getByText('RUNNING')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /stop/i })).toBeNull();
  });

  it('prints the service’s own status, then what it means', () => {
    // the dashboard collapses eight statuses into "queued"; a detail page
    // has no excuse to, so the record's word is the value and the gloss
    // is the explanation
    renderComponent(
      <JobLifecyclePanel job={job({ status: 'STAGING_INPUTS' })} />
    );
    expect(screen.getByText('STAGING_INPUTS')).toBeInTheDocument();
    expect(screen.getByText(/copying inputs in/)).toBeInTheDocument();
  });

  it('warns beside the status when the wall clock is up, not instead of it', () => {
    // the record still says RUNNING and that stays true; what it cannot
    // say is that the scheduler's time is spent
    renderComponent(
      <JobLifecyclePanel
        job={job({
          status: 'RUNNING',
          maxMinutes: 60,
          remoteStarted: new Date(Date.now() - 61 * 60 * 1000).toISOString(),
        })}
      />
    );
    expect(screen.getByText('RUNNING')).toBeInTheDocument();
    expect(screen.getByText(/computing on the node/)).toBeInTheDocument();
    expect(screen.getByText(/past its 1h limit/)).toBeInTheDocument();
  });

  it('leaves a run inside its allowance alone', () => {
    renderComponent(
      <JobLifecyclePanel
        job={job({
          status: 'RUNNING',
          maxMinutes: 60,
          remoteStarted: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        })}
      />
    );
    expect(screen.getByText(/computing on the node/)).toBeInTheDocument();
    expect(screen.queryByText(/limit/)).toBeNull();
  });

  it('shows an unknown status bare rather than guessing at it', () => {
    renderComponent(<JobLifecyclePanel job={job({ status: 'NEW_THING' })} />);
    expect(screen.getByText('NEW_THING')).toBeInTheDocument();
    expect(screen.queryByText(/^·/)).toBeNull();
  });
});

describe('the press', () => {
  it('asks before hiding, and says what the door costs', () => {
    renderComponent(<JobLifecyclePanel job={job()} />);
    fireEvent.click(screen.getByRole('button', { name: 'hide' }));
    // nothing has happened yet
    expect(hideJob).not.toHaveBeenCalled();
    expect(screen.getByText('Hide job')).toBeInTheDocument();
    // the sentence carries <b> tags, so it spans several text nodes
    const said = screen.getByRole('dialog').textContent ?? '';
    expect(said).toMatch(/leaves every job listing and search/);
    // and it says the way back, which is the part nobody would guess
    expect(said).toMatch(/link is the way back in/);
    expect(said).toMatch(/Nothing is deleted/);

    fireEvent.click(screen.getByRole('button', { name: 'Hide it' }));
    expect(hideJob).toHaveBeenCalledWith('u-1');
  });

  it('lets you back out of the question', () => {
    renderComponent(<JobLifecyclePanel job={job()} />);
    fireEvent.click(screen.getByRole('button', { name: 'hide' }));
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(hideJob).not.toHaveBeenCalled();
  });

  it('does not ask on the way back — unhiding takes nothing away', () => {
    renderComponent(<JobLifecyclePanel job={job({ visible: false })} />);
    fireEvent.click(screen.getByRole('button', { name: 'unhide' }));
    expect(unhideJob).toHaveBeenCalledWith('u-1');
  });

  it('offers nothing to someone who cannot manage the job', () => {
    renderComponent(<JobLifecyclePanel job={job({ owner: 'someone-else' })} />);
    expect(screen.getByText('listed')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'hide' })).toBeNull();
  });

  it('allows the creator as well as the owner', () => {
    // pipelines submit as one user on behalf of another, and the service
    // allows both — the same gate Sharing & access uses
    renderComponent(
      <JobLifecyclePanel
        job={job({ owner: 'someone-else', createdby: 'cgarcia' })}
      />
    );
    expect(screen.getByRole('button', { name: 'hide' })).toBeInTheDocument();
  });

  it('shows a failure rather than swallowing it', () => {
    (Hooks.useHideJob as jest.Mock).mockReturnValue(
      mutation({ hideJob, error: new Error('the service said no') })
    );
    renderComponent(<JobLifecyclePanel job={job()} />);
    expect(screen.getByText(/the service said no/)).toBeInTheDocument();
  });
});
