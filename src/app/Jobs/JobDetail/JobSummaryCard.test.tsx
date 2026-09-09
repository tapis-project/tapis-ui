import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import renderComponent from 'testing/utils';
import { Jobs } from '@tapis/tapis-typescript';
import JobSummaryCard, { resourceSummary } from './JobSummaryCard';
import { setJobFacts } from './jobFacts';
import {
  knownProjects,
  rememberProjects,
  resetKnownProjects,
} from '../_components/knownAllocations';

// the box is open by default and every test but the accordion's own wants
// it that way; localStorage persists across tests in a suite
beforeEach(() => setJobFacts(true));

const job = {
  uuid: 'b1e2-c3d4',
  name: 'SleepSeconds',
  status: Jobs.JobStatusEnum.Finished,
  condition: 'NORMAL_COMPLETION',
  jobType: Jobs.JobJobTypeEnum.Batch,
  owner: 'cgarcia',
  tenant: 'tacc',
  created: new Date(Date.now() - 3600_000).toISOString(),
  appId: 'demo-app',
  appVersion: '0.0.1',
  execSystemId: 'frontera',
  execSystemLogicalQueue: 'normal',
  execSystemOutputDir: '/scratch/run/output',
  execSystemExecDir: '/scratch/run/exec',
  archiveSystemId: 'stockyard',
  nodeCount: 2,
  coresPerNode: 48,
  memoryMB: 2048,
  maxMinutes: 60,
  remoteJobId: '3492011',
  remoteQueue: 'normal',
} as unknown as Jobs.Job;

const render = (
  overrides: Partial<Jobs.Job> = {},
  onBrowse?: (path: string) => void
) =>
  renderComponent(
    <JobSummaryCard
      job={{ ...job, ...overrides }}
      actions={<button type="button">Resubmit</button>}
      onBrowse={onBrowse}
    />
  );

describe('allocations beside the quota line', () => {
  beforeEach(() => resetKnownProjects());

  it('shows the -A chips the cluster has listed for the exec system', () => {
    rememberProjects('frontera', ['TACC-123', 'ICICLE-9']);
    render();
    expect(screen.getByText('-A TACC-123')).toBeInTheDocument();
    expect(screen.getByText('-A ICICLE-9')).toBeInTheDocument();
  });

  it('stays silent for a system the cluster never spoke about', () => {
    render();
    expect(screen.queryByText(/^-A /)).toBeNull();
  });

  it("raises the run's own -A and reservation from its scheduler options", () => {
    render({
      parameterSet: JSON.stringify({
        schedulerOptions: [
          { arg: '--tapis-profile tacc-apptainer', include: true },
          { arg: '-A TRA24006', include: true },
          {
            arg: '--reservation Tapis+Tutorial+Gateways-TEST',
            include: true,
          },
        ],
      }),
    } as any);
    expect(screen.getByText('-A TRA24006')).toBeInTheDocument();
    expect(
      screen.getByText('rsv Tapis+Tutorial+Gateways-TEST')
    ).toBeInTheDocument();
  });

  it("does not repeat the run's own allocation as an alternative", () => {
    rememberProjects('frontera', ['TRA24006', 'OTH21077']);
    render({
      parameterSet: JSON.stringify({
        schedulerOptions: [{ arg: '-A TRA24006', include: true }],
      }),
    } as any);
    // one chip for the used allocation, one for the genuine alternative
    expect(screen.getAllByText('-A TRA24006')).toHaveLength(1);
    expect(screen.getByText('-A OTH21077')).toBeInTheDocument();
  });
});

describe('a cancel in flight', () => {
  it('says cancelling over the REAL status, with the async story', () => {
    renderComponent(
      <JobSummaryCard
        job={{ ...job, status: Jobs.JobStatusEnum.Running } as any}
        cancelling
        cancelConfirmed
        actions={null}
      />
    );
    // the strip carries the in-flight truth; the status is not lied about
    expect(screen.getByText(/was sent and accepted/)).toBeInTheDocument();
    expect(screen.getByText(/Cancels are asynchronous/)).toBeInTheDocument();
    expect(screen.queryByText(/Cancelled on request/)).toBeNull();
  });

  it('adds the acknowledgment when the job record carries it', () => {
    renderComponent(
      <JobSummaryCard
        job={
          {
            ...job,
            status: Jobs.JobStatusEnum.Running,
            lastMessage:
              'JOBS_CMD_MSG_RECEIVED Job x received a JOB_CANCEL command',
          } as any
        }
        cancelling
        actions={null}
      />
    );
    expect(
      screen.getByText(/and the job has acknowledged it/)
    ).toBeInTheDocument();
  });
});

describe('a blocked run on the card', () => {
  it('reads the quota hold in plain words, transcript one press away', () => {
    render({
      status: Jobs.JobStatusEnum.Blocked,
      condition: undefined,
      lastMessage:
        'JOBS_QUOTA_MAX_USER_QUEUE_JOBS The job quota of 1 on system ' +
        'vista-tapis has been filled for user cgarcia.',
    } as any);
    expect(
      screen.getByText(/vista-tapis allows 1 queued job per user/)
    ).toBeInTheDocument();
    expect(screen.getByText(/Tapis retries on its own/)).toBeInTheDocument();
    // the raw code stays behind the disclosure, as everywhere else
    expect(screen.queryByText(/JOBS_QUOTA_MAX_USER_QUEUE_JOBS/)).toBeNull();
  });
});

describe('how an ending reads on the card', () => {
  it('a cancel speaks human and stays out of the red', () => {
    render({
      status: Jobs.JobStatusEnum.Cancelled,
      condition: 'CANCELLED_BY_USER',
      lastMessage:
        'JOBS_CMD_MSG_RECEIVED Job b1e2-c3d4 received a JOB_CANCEL command ' +
        'from JobsImpl-cancelCmdStatus with correlation id b1e2-c3d4.',
    } as any);
    expect(screen.getByText(/Cancelled on request/)).toBeInTheDocument();
    // the transcript is behind the disclosure, not on the card face
    expect(screen.queryByText(/JOBS_CMD_MSG_RECEIVED/)).toBeNull();
  });

  it('a real failure keeps its translated headline over the raw chain', () => {
    render({
      status: Jobs.JobStatusEnum.Failed,
      condition: 'SCHEDULER_OUT_OF_MEMORY',
      lastMessage: 'JOBS_SOME_WRAPPER something exploded deep inside',
    } as any);
    expect(screen.getByText(/Ran out of memory/)).toBeInTheDocument();
  });
});

describe('hidden, said on the page', () => {
  it('wears a chip once the run is out of the listings', () => {
    // the state used to live ONLY in the cog's own label, so the act that
    // set it was the only place you could read it back
    render({ visible: false } as any);
    expect(screen.getByText('hidden')).toBeInTheDocument();
  });

  it('says nothing at all about the normal case', () => {
    render({ visible: true } as any);
    expect(screen.queryByText('hidden')).toBeNull();
    // and a record that never mentions it is not hidden either
    render();
    expect(screen.queryByText('hidden')).toBeNull();
  });
});

describe('a refusal that names your projects', () => {
  beforeEach(() => resetKnownProjects());

  const REFUSAL = [
    'JOBS_REMOTE_SUBMIT_ERROR Remote submission failed:',
    'ERROR: You have multiple projects to charge to - please specify',
    'Note that your available projects are:',
    'CTS21005',
    'OTH21077',
    '',
    'Job not submitted.',
  ].join('\n');

  it('turns the list into chips, and remembers it for the launcher', () => {
    render({
      condition: 'JOB_REMOTE_SUBMIT_FAILED' as never,
      lastMessage: REFUSAL,
    });
    expect(screen.getByText('CTS21005')).toBeInTheDocument();
    expect(screen.getByText('OTH21077')).toBeInTheDocument();
    // kept per exec system — the Scheduler section offers these next time
    expect(knownProjects('frontera')).toEqual(['CTS21005', 'OTH21077']);
  });

  it('stays quiet on failures that say nothing about projects', () => {
    render({
      condition: 'JOB_EXECUTION_FAILED' as never,
      lastMessage: 'JOB_QUEUE_FAILURE the node ran out of walltime',
    });
    expect(screen.queryByText(/pick one to copy/)).toBeNull();
    expect(knownProjects('frontera')).toEqual([]);
  });
});

describe('resourceSummary', () => {
  it('says the shape of the allocation in one line', () => {
    expect(resourceSummary(job)).toBe(
      '2 nodes · 48 cores/node · 2 GB · up to 1h 0m'
    );
  });

  it('names only the parts the job actually set', () => {
    expect(resourceSummary({ nodeCount: 1 } as Jobs.Job)).toBe('1 node');
    expect(resourceSummary({} as Jobs.Job)).toBe('');
  });

  it('keeps small memory in MB rather than a fraction of a GB', () => {
    expect(resourceSummary({ memoryMB: 512 } as Jobs.Job)).toBe('512 MB');
  });
});

describe('JobSummaryCard', () => {
  it('leads with what ran, where, and what it cost', () => {
    render();
    expect(screen.getByText('SleepSeconds')).toBeInTheDocument();
    expect(screen.getByText(/demo-app:0.0.1/)).toBeInTheDocument();
    expect(screen.getByText('frontera')).toBeInTheDocument();
    expect(screen.getByText('normal')).toBeInTheDocument();
    expect(
      screen.getByText('2 nodes · 48 cores/node · 2 GB · up to 1h 0m')
    ).toBeInTheDocument();
  });

  it("surfaces the scheduler's own id, which was JSON-only", () => {
    render();
    // the number a support ticket asks for, and the one you paste into squeue
    expect(screen.getByText('3492011')).toBeInTheDocument();
    expect(screen.getByLabelText('Copy Remote job id')).toBeInTheDocument();
  });

  it('groups a directory under the system it is on', () => {
    render();
    // the exec system's three, and the archive's one — not four rows of
    // their own, which is what made two of them read as "output"
    expect(screen.getByText('/scratch/run/exec')).toBeInTheDocument();
    expect(screen.getByText('/scratch/run/output')).toBeInTheDocument();
    expect(screen.getByText('Execution')).toBeInTheDocument();
    expect(screen.queryByText('Output dir')).not.toBeInTheDocument();
  });

  it('explains a failure instead of printing the chain', () => {
    render({
      condition: 'JOB_EXECUTION_FAILED' as never,
      lastMessage:
        'JOBS_WORKER_PROCESSING_ERROR ... Error: ERROR: Unknown project Tapis-shared',
    });
    // the innermost cause is the headline; the transcript stays one press away
    expect(
      screen.getByText(/Unknown project Tapis-shared/)
    ).toBeInTheDocument();
  });

  it('says nothing about facts the job does not have', () => {
    render({
      remoteJobId: undefined,
      archiveSystemId: undefined,
      nodeCount: undefined,
      coresPerNode: undefined,
      memoryMB: undefined,
      maxMinutes: undefined,
    });
    // labels are uppercased in CSS, so the DOM still reads as prose
    expect(screen.queryByText('Scheduler')).not.toBeInTheDocument();
    expect(screen.queryByText('Archive')).not.toBeInTheDocument();
    expect(screen.queryByText('Resources')).not.toBeInTheDocument();
    // and the ones it does have are still there
    expect(screen.getByText('Execution')).toBeInTheDocument();
  });

  it('flags a job that had to fight to get submitted', () => {
    render({ remoteSubmitRetries: 3, blockedCount: 2 });
    expect(screen.getByText('3 submit retries')).toBeInTheDocument();
    expect(screen.getByText('blocked 2×')).toBeInTheDocument();
  });
});

describe('the card, against the rest of the shell', () => {
  it('uses the same padding as every other card on a landing', () => {
    // WELL is p: 1.25 — 10px. This card was 1.5, and being the first thing
    // on the page that read as the job detail starting lower than the app
    // detail next to it.
    const { container } = render();
    expect(container.firstElementChild).toHaveStyle('padding: 10px');
  });
});

describe('the head line, as chips', () => {
  it('says how long it ran as a chip beside the job type', () => {
    render({
      remoteStarted: new Date(Date.now() - 300_000).toISOString(),
      ended: new Date().toISOString(),
    } as never);
    expect(screen.getByText('BATCH')).toBeInTheDocument();
    expect(screen.getByText('5m 0s')).toBeInTheDocument();
  });

  it('marks a run that has not stopped yet', () => {
    render({
      remoteStarted: new Date(Date.now() - 300_000).toISOString(),
      ended: undefined,
    } as never);
    expect(screen.getByText('5m 0s so far')).toBeInTheDocument();
  });

  it('says nothing about runtime for a job that never started', () => {
    render({ remoteStarted: undefined } as never);
    expect(screen.queryByText(/so far/)).not.toBeInTheDocument();
  });
});

describe("travelling to the job's directories", () => {
  it('sends each directory, with the system it is on, to the listing below', () => {
    const onBrowse = jest.fn();
    render({}, onBrowse);

    fireEvent.click(screen.getByLabelText('Browse output directory'));
    expect(onBrowse).toHaveBeenCalledWith('/scratch/run/output', 'frontera');

    fireEvent.click(screen.getByLabelText('Browse exec directory'));
    expect(onBrowse).toHaveBeenCalledWith('/scratch/run/exec', 'frontera');
  });

  it('opens the archive directory here too, on its own system', () => {
    // it used to be a link that left the page, which is the one thing the
    // listing under the card exists to avoid
    const onBrowse = jest.fn();
    render({ archiveSystemDir: '/archive/jobs/1' } as never, onBrowse);
    fireEvent.click(screen.getByLabelText('Browse archive directory'));
    expect(onBrowse).toHaveBeenCalledWith('/archive/jobs/1', 'stockyard');
  });

  it('also offers the Files page, as a real link', () => {
    render({}, jest.fn());
    expect(
      screen.getByLabelText('Open output directory in Files')
    ).toHaveAttribute('href', '/#/files/frontera/scratch/run/output');
  });

  it('puts copy at the end of the cluster, not adrift at the path', () => {
    render({}, jest.fn());
    const cluster = screen.getByLabelText('Browse output directory')
      .parentElement!;
    expect(
      Array.from(cluster.children).map((el) => el.getAttribute('aria-label'))
    ).toEqual([
      'Browse output directory',
      'Open output directory in Files',
      'Copy output directory',
    ]);
  });

  it('offers nothing to browse on a page that cannot', () => {
    render();
    expect(screen.queryByLabelText('Browse output directory')).toBeNull();
    // the Files link and the copy are still there
    expect(
      screen.getByLabelText('Open output directory in Files')
    ).toBeInTheDocument();
  });

  it('names only the directories the job has', () => {
    render({ execSystemExecDir: undefined, execSystemInputDir: undefined });
    expect(screen.getByText('output')).toBeInTheDocument();
    expect(screen.queryByText('exec')).not.toBeInTheDocument();
  });
});

describe('the details box', () => {
  it('opens and shuts on its own control, not the page-descriptions one', async () => {
    render();
    expect(screen.getByText('/scratch/run/output')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Details'));
    // shut, the header still answers the questions it is opened for most
    expect(
      screen.getByText(
        'frontera · 2 nodes · 48 cores/node · 2 GB · up to 1h 0m · 3492011'
      )
    ).toBeInTheDocument();
    // the grid leaves with the collapse rather than with the click
    await waitFor(() =>
      expect(screen.queryByText('/scratch/run/output')).not.toBeInTheDocument()
    );
  });

  it('remembers, so it does not spring open on the next job', () => {
    setJobFacts(false);
    render();
    expect(screen.queryByText('/scratch/run/output')).not.toBeInTheDocument();
    expect(screen.getByText('SleepSeconds')).toBeInTheDocument();
  });
});
