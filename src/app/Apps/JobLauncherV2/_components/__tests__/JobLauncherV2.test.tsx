import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import renderComponent from 'testing/utils';
import { Apps, Jobs, Systems } from '@tapis/tapis-typescript';
import {
  Apps as AppsHooks,
  Jobs as JobsHooks,
  Systems as SystemsHooks,
} from '@tapis/tapisui-hooks';
import JobLauncherV2 from '../JobLauncherV2';
import {
  rememberProjects,
  resetKnownProjects,
} from 'app/Jobs/_components/knownAllocations';

jest.mock('@tapis/tapisui-hooks');

const system = {
  id: 'frontera',
  canRunBatch: true,
  batchDefaultLogicalQueue: 'normal',
  batchLogicalQueues: [
    {
      name: 'normal',
      hpcQueueName: 'normal',
      minMinutes: 1,
      maxMinutes: 120,
      minNodeCount: 1,
      maxNodeCount: 64,
    },
  ],
} as Systems.TapisSystem;

const app = {
  id: 'flexserv',
  version: '1.4.0',
  jobType: Apps.JobTypeEnum.Batch,
  jobAttributes: {
    execSystemId: 'frontera',
    maxMinutes: 60,
    archiveSystemId: 'cloud.data',
    archiveSystemDir:
      'HOST_EVAL($WORK)/tapis-jobs-archive/${JobCreateDate}/${JobName}-${JobUUID}',
    archiveOnAppError: true,
    parameterSet: {
      appArgs: [
        {
          name: 'input',
          arg: '--in data',
          inputMode: Apps.ArgInputModeEnum.Required,
        },
      ],
      containerArgs: [
        {
          name: 'gpus',
          arg: '--gpus all',
          inputMode: Apps.ArgInputModeEnum.Fixed,
        },
      ],
      envVariables: [{ key: 'MODE', value: 'fast' }],
      archiveFilter: { includeLaunchFiles: true, includes: [], excludes: [] },
      schedulerOptions: [
        {
          name: 'TACC Allocation',
          arg: '-A <<allocation>>',
          inputMode: Apps.ArgInputModeEnum.IncludeByDefault,
        },
        {
          name: 'Nodes',
          arg: '-N 1',
          inputMode: Apps.ArgInputModeEnum.IncludeByDefault,
        },
        {
          name: 'TACC Reservation',
          arg: '--reservation <<reservation>>',
          // arrives with include=false, so a value typed into it would
          // otherwise be silently dropped
          inputMode: Apps.ArgInputModeEnum.IncludeOnDemand,
        },
      ],
    },
  },
} as Apps.TapisApp;

const submit = jest.fn();

const mockHooks = () => {
  (AppsHooks.useDetail as jest.Mock).mockReturnValue({
    data: { result: app },
    isLoading: false,
    error: null,
  });
  (SystemsHooks.useList as jest.Mock).mockReturnValue({
    data: { result: [system, archiveSystem] },
    isLoading: false,
    error: null,
  });
  (SystemsHooks.useSchedulerProfiles as jest.Mock).mockReturnValue({
    data: { result: [] },
    isLoading: false,
    error: null,
  });
  (JobsHooks.useSubmit as jest.Mock).mockReturnValue({
    submit,
    isLoading: false,
    isSuccess: false,
    error: null,
    data: undefined,
    reset: jest.fn(),
  });
};

const archiveSystem = { id: 'cloud.data' } as Systems.TapisSystem;

const render = () =>
  renderComponent(<JobLauncherV2 appId="flexserv" appVersion="1.4.0" />);

describe('JobLauncherV2 panel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockHooks();
  });

  it('opens on Basics with every section in the nav', () => {
    render();
    expect(screen.getByText('Job basics')).toBeInTheDocument();
    ['Execution', 'File inputs', 'Arguments', 'Scheduler', 'Review'].forEach(
      (label) => expect(screen.getAllByText(label).length).toBeGreaterThan(0)
    );
    // one section at a time: the review body is not mounted yet
    expect(screen.queryByText(/exact request body/)).not.toBeInTheDocument();
  });

  it('shows the selected queue limits when Execution is opened', () => {
    render();
    // the label appears in the nav and in the mobile jump strip
    fireEvent.click(screen.getAllByText('Execution')[0]);
    expect(
      screen.getByText('Execution system & resources')
    ).toBeInTheDocument();
    expect(screen.getByText('Maximum Minutes')).toBeInTheDocument();
    // the queue ceiling is offered as a click-to-fill chip, not just an error
    expect(screen.getByText('max 120')).toBeInTheDocument();
  });

  it("blocks submission while the app's -A placeholder is unresolved", async () => {
    render();
    // validation runs on mount, then again on a 250ms debounce after edits,
    // and the header reads a 200ms-debounced snapshot of the result — so the
    // settle is ~450ms, which outruns findByText's 1s default on a busy machine
    expect(
      await screen.findByText(/1 to fix/, undefined, { timeout: 5000 })
    ).toBeInTheDocument();
    // the header routes to Review; Review owns the button that submits
    fireEvent.click(screen.getByRole('button', { name: /Review & submit/ }));
    expect(
      await screen.findByRole('button', { name: /Submit Job/ })
    ).toBeDisabled();

    fireEvent.click(screen.getAllByText('Scheduler')[0]);
    const allocation = screen.getByLabelText(
      /Allocation \(project\)/
    ) as HTMLInputElement;
    expect(allocation.value).toBe('<<allocation>>');

    // the row cells commit on blur or after a pause, so a keystroke does not
    // re-render the form — clicking away is what a user does here
    fireEvent.change(allocation, { target: { value: 'MY-PROJECT-1' } });
    fireEvent.blur(allocation);
    expect(
      await screen.findByText(/ready to submit/, undefined, { timeout: 5000 })
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Review & submit/ }));
    const submitButton = await screen.findByRole('button', {
      name: /Submit Job/,
    });
    await waitFor(() => expect(submitButton).toBeEnabled(), { timeout: 5000 });
  }, 20000);

  it('does not claim ready to submit before the first check lands', async () => {
    render();
    // green on open, corrected a moment later, is exactly backwards
    expect(screen.getByText('checking…')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Review & submit/ }));
    expect(
      await screen.findByRole('button', { name: /Submit Job/ })
    ).toBeDisabled();
  });

  it('does not nag about a row you only just added', async () => {
    render();
    // settle first: the app's own -A placeholder is the one real problem
    await screen.findByText('1 to fix', undefined, { timeout: 5000 });

    fireEvent.click(screen.getAllByText('Arguments')[0]);
    fireEvent.click(screen.getAllByRole('button', { name: '+ Add' })[0]);

    // a blank row is not an error — it is a row you have not filled in yet,
    // and assembleJob drops it if it stays that way
    await new Promise((resolve) => setTimeout(resolve, 800));
    expect(screen.getByText('1 to fix')).toBeInTheDocument();

    // ...but give it a name and it owes you a value
    const names = screen.getAllByPlaceholderText('name');
    fireEvent.change(names[names.length - 1], { target: { value: 'mine' } });
    fireEvent.blur(names[names.length - 1]);
    expect(
      await screen.findByText('2 to fix', undefined, { timeout: 5000 })
    ).toBeInTheDocument();
  });

  it('says the job was submitted once, with a way into it', async () => {
    const reset = jest.fn();
    (JobsHooks.useSubmit as jest.Mock).mockReturnValue({
      submit,
      isLoading: false,
      isSuccess: true,
      error: null,
      data: { result: { uuid: 'job-uuid-007' } },
      reset,
    });
    render();
    fireEvent.click(screen.getAllByText('Review')[0]);

    expect(await screen.findByText('Job submitted')).toBeInTheDocument();
    expect(screen.getByText('job-uuid-007')).toBeInTheDocument();
    // the receipt replaces the readiness box rather than stacking on it
    expect(
      screen.queryByText('The job is ready for submission.')
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Open job/ })
    ).toBeInTheDocument();

    // and it can be got rid of, which is what starting the next job means
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(reset).toHaveBeenCalled();
  });

  it('stops claiming submitted once the form no longer matches', async () => {
    const reset = jest.fn();
    (JobsHooks.useSubmit as jest.Mock).mockReturnValue({
      submit,
      isLoading: false,
      isSuccess: true,
      error: null,
      data: { result: { uuid: 'job-uuid-007' } },
      reset,
    });
    render();
    await screen.findByText('submitted', undefined, { timeout: 5000 });

    // break something: the receipt describes a job this form no longer is
    fireEvent.click(screen.getAllByText('Scheduler')[0]);
    const allocation = screen.getByLabelText(
      /Allocation \(project\)/
    ) as HTMLInputElement;
    fireEvent.change(allocation, { target: { value: '' } });
    fireEvent.blur(allocation);

    await waitFor(() => expect(reset).toHaveBeenCalled(), { timeout: 5000 });
  });

  it('keeps a long submission error to one line until asked', async () => {
    const long = `Job submission failed: ${'the scheduler said no. '.repeat(
      30
    )}`;
    (JobsHooks.useSubmit as jest.Mock).mockReturnValue({
      submit,
      isLoading: false,
      isSuccess: false,
      error: new Error(long),
      data: undefined,
      reset: jest.fn(),
    });
    render();
    fireEvent.click(screen.getAllByText('Review')[0]);

    expect(
      await screen.findByText('The job was not submitted')
    ).toBeInTheDocument();
    // collapsed: one clamped line, no <pre>
    expect(document.querySelector('pre')).toBeNull();

    // the red line IS the control — no separate 'details' link to hunt for
    const toggle = screen.getByRole('button', {
      name: /the scheduler said no/,
    });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    const pre = document.querySelector('pre');
    expect(pre).not.toBeNull();
    expect(pre?.textContent).toBe(long);
    expect(screen.getByLabelText('Copy the full error')).toBeInTheDocument();
  });

  it('pretty-prints an error that turns out to be JSON', async () => {
    (JobsHooks.useSubmit as jest.Mock).mockReturnValue({
      submit,
      isLoading: false,
      isSuccess: false,
      error: new Error('{"status":"error","message":"bad queue"}'),
      data: undefined,
      reset: jest.fn(),
    });
    render();
    fireEvent.click(screen.getAllByText('Review')[0]);
    fireEvent.click(
      await screen.findByRole('button', { name: /status.*error.*bad queue/ })
    );

    expect(document.querySelector('pre')?.textContent).toBe(
      '{\n  "status": "error",\n  "message": "bad queue"\n}'
    );
  });

  it('the header hands you to Review rather than submitting behind your back', async () => {
    render();
    await screen.findByText(/1 to fix/, undefined, { timeout: 5000 });

    fireEvent.click(screen.getByRole('button', { name: /Review & submit/ }));
    expect(
      await screen.findByText(/thing to fix before this job can be submitted/)
    ).toBeInTheDocument();
    // it routes; it never submits
    expect(submit).not.toHaveBeenCalled();
  });

  it('opens pre-filled from a job, and says where the form came from', () => {
    renderComponent(
      <JobLauncherV2
        appId="flexserv"
        appVersion="1.4.0"
        seedValues={{ name: 'rerun-me', nodeCount: 7 }}
        seededFrom={{ uuid: 'u-9', name: 'old-run' }}
      />
    );
    // the seed lands in the form: Basics shows the old job's name
    expect(screen.getByDisplayValue('rerun-me')).toBeInTheDocument();
    // and the provenance chip owns the honesty: new job, old one untouched
    expect(screen.getByText('from old-run')).toBeInTheDocument();
  });

  it('rings the Submit button on every Review & submit press', async () => {
    render();
    await screen.findByText(/1 to fix/, undefined, { timeout: 5000 });

    fireEvent.click(screen.getByRole('button', { name: /Review & submit/ }));
    const button = await screen.findByRole('button', { name: /Submit Job/ });
    // the hand-off points: the wrapper is flashing, aimed at the button
    expect(button.parentElement).toHaveAttribute('data-submitflash', '1');
    // pressing it again re-rings rather than doing nothing visible
    fireEvent.click(screen.getByRole('button', { name: /Review & submit/ }));
    const again = await screen.findByRole('button', { name: /Submit Job/ });
    expect(again.parentElement).toHaveAttribute('data-submitflash', '2');
    // arriving by any other route stays quiet: the flash clears with its
    // animation
    fireEvent.animationEnd(again.parentElement!);
    expect(
      (await screen.findByRole('button', { name: /Submit Job/ })).parentElement
    ).not.toHaveAttribute('data-submitflash');
  });

  it('sends you to the blocker list when you press the count', async () => {
    render();
    // the app ships an unfilled -A <<allocation>>, so there is one blocker
    const count = await screen.findByText('1 to fix', undefined, {
      timeout: 5000,
    });

    fireEvent.click(count);
    expect(
      await screen.findByText(/thing to fix before this job can be submitted/)
    ).toBeInTheDocument();
  });

  it('reads the summary in a pane or folded into the nav', async () => {
    render();
    // neither by default — the sections get the full width
    expect(screen.queryByText('Summary')).not.toBeInTheDocument();

    fireEvent.click(screen.getByText('Pane'));
    expect(screen.getByText('Summary')).toBeInTheDocument();

    fireEvent.click(screen.getByText('In nav'));
    expect(screen.queryByText('Summary')).not.toBeInTheDocument();
    // the nav row now carries the section's own summary lines
    const executionRow = screen
      .getAllByText('Execution')[0]
      .closest('[role="button"]') as HTMLElement;
    await waitFor(() =>
      expect(executionRow.textContent).toContain('Command Prefix')
    );
    expect(executionRow.textContent).toContain('frontera');
    // a rule under each block, inset like the pane's, so the sections read as
    // blocks rather than running together
    expect(executionRow.querySelector('hr')).not.toBeNull();

    // pressing the active one again leaves neither
    fireEvent.click(screen.getByText('In nav'));
    expect(executionRow.textContent).not.toContain('Command Prefix');
  });

  it('marks a row you have not filled in as not part of the job', () => {
    render();
    fireEvent.click(screen.getAllByText('Arguments')[0]);
    fireEvent.click(screen.getAllByRole('button', { name: '+ Add' })[0]);
    expect(screen.getByText('empty')).toBeInTheDocument();
  });

  it('jumps to the JSON editor from the header, and with ⌘J', async () => {
    render();
    fireEvent.click(screen.getByRole('button', { name: /JSON/ }));
    expect(await screen.findByText(/Paste a job here/)).toBeInTheDocument();

    // back to preview, then the shortcut from anywhere in the panel
    fireEvent.click(screen.getByText('Preview'));
    expect(screen.getByText(/copy it for the CLI/)).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'j', metaKey: true });
    expect(await screen.findByText(/Paste a job here/)).toBeInTheDocument();
  });

  it('can take a pasted job into the form from Review', async () => {
    render();
    fireEvent.click(screen.getAllByText('Review')[0]);

    // preview by default — the request body, read-only. (The section subtitle
    // says 'request body' too, hence the more specific match.)
    expect(screen.getByText(/copy it for the CLI/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Paste JSON' }));
    expect(screen.getByText(/Paste a job here/)).toBeInTheDocument();

    // JSONEditor is lazy — CodeMirror is kept out of the eager bundle — so the
    // editor and its action arrive after the chunk resolves
    expect(
      await screen.findByRole(
        'button',
        { name: /apply to the form/i },
        { timeout: 5000 }
      )
    ).toBeInTheDocument();
    // one submit path: paste applies to the form, it does not submit on its own
    expect(submit).not.toHaveBeenCalled();
  });

  it('says what the app already declared at the top of args and env', () => {
    render();
    fireEvent.click(screen.getAllByText('Arguments')[0]);
    expect(
      screen.getByText(/2 arguments carried over from flexserv/)
    ).toBeInTheDocument();

    fireEvent.click(screen.getAllByText('Environment')[0]);
    expect(
      screen.getByText(/1 environment variables carried over from flexserv/)
    ).toBeInTheDocument();
  });

  it("carries the app's archive defaults into the form", () => {
    render();
    fireEvent.click(screen.getAllByText('Archiving')[0]);

    const dir = screen.getByLabelText(
      /Archive System Directory/
    ) as HTMLInputElement;
    expect(dir.value).toBe(
      'HOST_EVAL($WORK)/tapis-jobs-archive/${JobCreateDate}/${JobName}-${JobUUID}'
    );
    expect(
      (screen.getByLabelText(/Archive System ID/) as HTMLSelectElement).value
    ).toBe('cloud.data');
    expect(screen.getByLabelText(/Archive On App Error/)).toBeChecked();
    expect(screen.getByLabelText(/Include Launch Files/)).toBeChecked();
  });

  it('prompts to include a flag the user has set but the app left out', async () => {
    render();
    fireEvent.click(screen.getAllByText('Scheduler')[0]);

    const reservation = screen.getByLabelText(
      /Reservation name/
    ) as HTMLInputElement;
    expect(reservation.value).toBe('<<reservation>>');
    // the app left it out, so no nagging until the user makes it theirs
    expect(screen.queryByText(/will not be sent/)).not.toBeInTheDocument();

    fireEvent.change(reservation, { target: { value: 'maintenance-42' } });
    fireEvent.blur(reservation);
    expect(
      await screen.findByText(/will not be sent/, undefined, { timeout: 5000 })
    ).toBeInTheDocument();

    // ...and the nav says so too, so you would notice from another section.
    // It reads the debounced snapshot, so it lands a beat after the row does.
    expect(
      await screen.findByText('1 to check', undefined, { timeout: 5000 })
    ).toBeInTheDocument();
    const schedulerRow = screen
      .getAllByText('Scheduler')[0]
      .closest('[role="button"]') as HTMLElement;
    expect(schedulerRow.textContent).toBe('Scheduler1');

    fireEvent.click(screen.getByRole('button', { name: 'Include it' }));
    expect(screen.queryByText(/will not be sent/)).not.toBeInTheDocument();
    // the flag is its own cell now, with the value beside it
    expect(screen.getByText('--reservation')).toBeInTheDocument();
    expect((reservation as HTMLInputElement).value).toBe('maintenance-42');
  });

  it('flags the offending section in the nav, and clears it once fixed', async () => {
    render();
    const schedulerRow = screen
      .getAllByText('Scheduler')[0]
      .closest('[role="button"]') as HTMLElement;

    // red tally of problems on the row that owns the unresolved -A placeholder
    await screen.findByText(/1 to fix/, undefined, { timeout: 5000 });
    expect(schedulerRow.textContent).toBe('Scheduler1');

    fireEvent.click(screen.getAllByText('Scheduler')[0]);
    const allocationInput = screen.getByLabelText(/Allocation \(project\)/);
    fireEvent.change(allocationInput, { target: { value: 'MY-PROJECT-1' } });
    fireEvent.blur(allocationInput);

    // back to the quiet count of included flags — two of them, so this is a
    // different number than the error tally it replaced
    await screen.findByText(/ready to submit/, undefined, { timeout: 5000 });
    // the nav badge runs on its own debounce, a beat behind the header
    await waitFor(() => expect(schedulerRow.textContent).toBe('Scheduler2'), {
      timeout: 5000,
    });
    // nav badge and the summary pane both name the system
    expect(screen.getAllByText('frontera').length).toBeGreaterThan(0);
  }, 20000);

  it('submits the assembled job with numbers coerced', async () => {
    render();
    fireEvent.click(screen.getAllByText('Scheduler')[0]);
    const allocationField = screen.getByLabelText(/Allocation \(project\)/);
    fireEvent.change(allocationField, { target: { value: 'MY-PROJECT-1' } });
    fireEvent.blur(allocationField);
    await screen.findByText(/ready to submit/, undefined, { timeout: 5000 });
    fireEvent.click(screen.getByRole('button', { name: /Review & submit/ }));
    // Review debounces its own blocker pass, so the button arrives disabled
    // for a beat after the section mounts
    const submitButton = await screen.findByRole('button', {
      name: /Submit Job/,
    });
    await waitFor(() => expect(submitButton).toBeEnabled(), { timeout: 5000 });
    fireEvent.click(submitButton);
    await waitFor(() => expect(submit).toHaveBeenCalledTimes(1));
    const job = submit.mock.calls[0][0] as Partial<Jobs.ReqSubmitJob>;
    expect(job.appId).toBe('flexserv');
    expect(job.maxMinutes).toBe(60);
    expect(job.parameterSet?.schedulerOptions?.[0].arg).toBe('-A MY-PROJECT-1');
    // the app's FIXED --gpus arg is the app's to inject, not the job's to
    // restate — restating trips JOBS_FIXED_ARG_ERROR over any difference
    expect(job.parameterSet?.containerArgs).toBeUndefined();
    expect(job.parameterSet?.appArgs?.[0].name).toBe('input');
  }, 20000);
});

describe('projects a refused submission already named', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockHooks();
    resetKnownProjects();
  });

  it('offers them as one-press chips on the allocation field', () => {
    // a failed job's card parsed the submit filter's list and kept it per
    // system; the launcher reads that memory back
    rememberProjects('frontera', ['CTS21005']);
    render();
    fireEvent.click(screen.getAllByText('Scheduler')[0]);

    expect(
      screen.getByText('the cluster has listed yours:')
    ).toBeInTheDocument();
    fireEvent.click(screen.getByText('CTS21005'));
    expect(
      (screen.getByLabelText(/Allocation \(project\)/) as HTMLInputElement)
        .value
    ).toBe('CTS21005');
  });

  it('offers nothing on a system no refusal has taught it about', () => {
    rememberProjects('ls6', ['A-ccsc']);
    render();
    fireEvent.click(screen.getAllByText('Scheduler')[0]);
    expect(screen.queryByText('the cluster has listed yours:')).toBeNull();
  });
});

describe('rows the app author hid', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockHooks();
  });

  it('keeps a notes.isHidden argument out of the form', () => {
    // tap_jupyter marks its fixed --nv with isHidden; TAP keeps it out of
    // the form and it runs anyway, because the service injects fixed args
    (AppsHooks.useDetail as jest.Mock).mockReturnValue({
      data: {
        result: {
          ...app,
          jobAttributes: {
            ...app.jobAttributes,
            parameterSet: {
              ...app.jobAttributes!.parameterSet,
              containerArgs: [
                {
                  name: 'NVIDIA Flag',
                  description: 'Flag to enable NVIDIA cuda',
                  inputMode: Apps.ArgInputModeEnum.Fixed,
                  arg: '--nv',
                  notes: { isHidden: true },
                },
              ],
            },
          },
        },
      },
      isLoading: false,
      error: null,
    });
    render();
    fireEvent.click(screen.getAllByText('Arguments')[0]);

    expect(screen.getByText('App arguments')).toBeInTheDocument();
    expect(screen.queryByText('NVIDIA Flag')).toBeNull();
  });
});

describe('the environment section', () => {
  // The shared fixture keeps exactly one blocker (the -A placeholder), and
  // half the suite counts on that number — so richer env declarations are
  // swapped in per test rather than added to it.
  const withEnv = (envVariables: Array<Apps.KeyValuePair>) => {
    (AppsHooks.useDetail as jest.Mock).mockReturnValue({
      data: {
        result: {
          ...app,
          jobAttributes: {
            ...app.jobAttributes,
            parameterSet: {
              ...app.jobAttributes!.parameterSet,
              envVariables,
            },
          },
        },
      },
      isLoading: false,
      error: null,
    });
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockHooks();
  });

  const openEnv = () => fireEvent.click(screen.getAllByText('Environment')[0]);

  it('keeps descriptions behind the same Expand toggle the args have', () => {
    // an app declares DB_PASSWORD as REQUIRED and writes the description for
    // exactly the person who has to fill it in — this section used to be the
    // one place in the panel where it stayed invisible
    withEnv([
      {
        key: 'DB_PASSWORD',
        value: '',
        description: 'Password for the results database',
        inputMode: Apps.KeyValueInputModeEnum.Required,
      },
    ]);
    render();
    openEnv();

    expect(screen.getByText('required')).toBeInTheDocument();
    expect(
      screen.queryByDisplayValue('Password for the results database')
    ).not.toBeInTheDocument();

    fireEvent.click(
      screen.getByRole('button', { name: /Expand descriptions/ })
    );
    expect(
      screen.getByDisplayValue('Password for the results database')
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole('button', { name: /Collapse descriptions/ })
    );
    expect(
      screen.queryByDisplayValue('Password for the results database')
    ).not.toBeInTheDocument();
  });

  it('locks a fixed variable the way a fixed argument is locked', () => {
    withEnv([
      {
        key: 'PIPELINE',
        value: 'v2',
        description: 'Pinned by the app',
        inputMode: Apps.KeyValueInputModeEnum.Fixed,
      },
    ]);
    render();
    openEnv();

    expect(screen.getByText('fixed')).toBeInTheDocument();
    expect(screen.getByDisplayValue('v2')).toBeDisabled();
    expect(
      screen.getByTitle('Fixed by the app — cannot be removed')
    ).toBeInTheDocument();
    expect(screen.queryByTitle('Remove')).not.toBeInTheDocument();

    // and it cannot be excluded, any more than a fixed argument can
    const box = screen
      .getByTitle('This variable must be exported')
      .querySelector('input') as HTMLInputElement;
    expect(box).toBeChecked();
    expect(box).toBeDisabled();
  });

  it('starts an on-demand variable excluded, and includes without nagging', async () => {
    withEnv([
      {
        key: 'TRACE',
        value: '',
        description: 'Set to 1 for verbose logs',
        inputMode: Apps.KeyValueInputModeEnum.IncludeOnDemand,
      },
    ]);
    render();

    // excluded and empty is nothing to fix — the -A placeholder stands alone
    expect(
      await screen.findByText('1 to fix', undefined, { timeout: 5000 })
    ).toBeInTheDocument();

    openEnv();
    expect(screen.getByText('optional')).toBeInTheDocument();
    expect(screen.getByText('0 of 1 included')).toBeInTheDocument();
    const box = screen
      .getByTitle('Export this variable with the job')
      .querySelector('input') as HTMLInputElement;
    expect(box).not.toBeChecked();

    // included, it is still the app's declared (empty) default — the job
    // exports TRACE="" and that is legal, so nothing new to fix
    fireEvent.click(box);
    expect(screen.getByText('1 of 1 included')).toBeInTheDocument();
    await new Promise((resolve) => setTimeout(resolve, 800));
    expect(screen.getByText('1 to fix')).toBeInTheDocument();
  }, 20000);

  it('leaves an app-declared empty default alone', async () => {
    // apps ship value: "" on purpose (tap_jupyter's email variable) and the
    // service exports it as-is — nagging for a value here blocked real apps
    withEnv([
      {
        key: 'email',
        value: '',
        description: '',
        inputMode: Apps.KeyValueInputModeEnum.IncludeByDefault,
      },
    ]);
    render();

    expect(
      await screen.findByText('1 to fix', undefined, { timeout: 5000 })
    ).toBeInTheDocument();
  }, 20000);

  it('reads a declared key as identity while a new row still edits its own', () => {
    withEnv([{ key: 'MODE', value: 'fast' }]);
    render();
    openEnv();

    // renaming MODE here would quietly mint a new variable and leave the
    // declared one unset, so the key is text, like an argument's name
    expect(screen.getByText('MODE')).toBeInTheDocument();
    expect(screen.queryByDisplayValue('MODE')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '+ Add' }));
    expect(screen.getByPlaceholderText('KEY')).toBeInTheDocument();
  });

  it('blocks submission on a required variable until a value lands', async () => {
    withEnv([
      {
        key: 'DB_PASSWORD',
        value: '',
        description: 'Password for the results database',
        inputMode: Apps.KeyValueInputModeEnum.Required,
      },
    ]);
    render();

    // the app's -A placeholder plus the empty required variable
    expect(
      await screen.findByText('2 to fix', undefined, { timeout: 5000 })
    ).toBeInTheDocument();

    openEnv();
    const value = screen.getByPlaceholderText('value');
    fireEvent.change(value, { target: { value: 'hunter2' } });
    fireEvent.blur(value);

    expect(
      await screen.findByText('1 to fix', undefined, { timeout: 5000 })
    ).toBeInTheDocument();
  }, 20000);
});
