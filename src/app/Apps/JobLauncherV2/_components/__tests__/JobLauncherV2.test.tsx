import React from 'react';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import renderComponent from 'testing/utils';
import { Apps, Jobs, Systems } from '@tapis/tapis-typescript';
import {
  Apps as AppsHooks,
  Jobs as JobsHooks,
  Systems as SystemsHooks,
} from '@tapis/tapisui-hooks';
import JobLauncherV2 from '../JobLauncherV2';
import * as blockers from '../blockers';
import {
  launcherIntro,
  launcherSummary,
} from 'app/_components/PageShell/viewPrefs';
import {
  rememberProjects,
  resetKnownProjects,
} from 'app/Jobs/_components/knownAllocations';

jest.mock('@tapis/tapisui-hooks');

/**
 * Every test here mounts the whole launcher, and the launcher settles on a
 * chain of debounces: formik validates on a 250ms timer, the panel reads a
 * 200ms-debounced snapshot of the result, and the nav reads another. That is
 * ~450ms of wall clock per assertion on an idle machine, and this is the
 * slowest suite in the repo (~60s), so under a full parallel run it is the
 * one that gets starved. Jest's 5s default was being missed by whichever
 * test happened to land while the other workers were busy, which is a
 * machine-load failure dressed up as a test failure. The individual tests
 * that already ask for 20000 keep their own.
 */
jest.setTimeout(20000);

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
    // the summary mode is a preference now, and it is module state
    launcherSummary.reset();
    launcherIntro.reset();
  });
  afterEach(() => {
    launcherSummary.reset();
    launcherIntro.reset();
  });

  it('explains the walk on Basics, and tucks it away once read', () => {
    const { unmount } = render();
    expect(screen.getByText('Using the launcher')).toBeInTheDocument();
    // the two presses first, each beside what it does, then small print. No
    // second numbering (the pages are the steps), no label column of topics
    expect(screen.queryByText(/^step \d$/)).toBeNull();
    expect(screen.queryByText('red, amber')).toBeNull();
    expect(screen.getByText('Go to the next step')).toBeInTheDocument();
    expect(
      screen.getByText('Jump to the review page for final job submission')
    ).toBeInTheDocument();
    expect(
      screen.getByText(/count must be fixed before you submit/)
    ).toBeInTheDocument();

    // what an app is sits above the app's own facts
    expect(
      screen.getByText(/is a versioned definition of how Tapis/)
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Got it' }));
    expect(screen.queryByText('Go to the next step')).not.toBeInTheDocument();
    // the app line is the box's caption, not onboarding: it stays
    expect(
      screen.getByText(/is a versioned definition of how Tapis/)
    ).toBeInTheDocument();
    // remembered, and one press from coming back
    unmount();
    render();
    expect(screen.queryByText('Go to the next step')).not.toBeInTheDocument();
    fireEvent.click(
      screen.getByRole('button', { name: 'Show how to use the launcher' })
    );
    expect(screen.getByText('Go to the next step')).toBeInTheDocument();
  });

  it('says how this app runs, in its own terms', () => {
    const line = () =>
      screen.getByText(/is a versioned definition of how Tapis/);
    const { unmount } = render();
    // the fixture sets a job type but no runtime, so only that is said
    expect(line().textContent).toMatch(
      /This one runs as a batch job, queued by the scheduler\.$/
    );
    // said in the line, so it no longer takes a row of its own
    expect(screen.queryByText('type')).toBeNull();
    unmount();

    // not every app is a container image, and not every job waits in a queue
    (AppsHooks.useDetail as jest.Mock).mockReturnValue({
      data: {
        result: {
          ...app,
          runtime: Apps.RuntimeEnum.Zip,
          jobType: Apps.JobTypeEnum.Fork,
        },
      },
      isLoading: false,
      error: null,
    });
    render();
    expect(line().textContent).toMatch(
      /This one runs a ZIP of executables as a fork job, started directly on the host\./
    );
    // the facts under it keep the record's own keys, whatever the runtime:
    // a ZIP's bundle is still containerImage, never relabelled
    expect(screen.queryByText('zip')).toBeNull();
    expect(screen.queryByText('image')).toBeNull();
  });

  it('marks where each problem lives as a link, in its colour', async () => {
    render();
    await screen.findByText(/1 to fix/, undefined, { timeout: 5000 });
    fireEvent.click(
      within(screen.getByRole('group', { name: 'Step navigation' })).getByRole(
        'button',
        { name: /Review & Submit/ }
      )
    );
    const where = await screen.findByTitle('Go to Scheduler Options');
    const style = window.getComputedStyle(where);
    // red for what blocks, and underlined, so it reads as somewhere to go
    expect(style.color).toBe('rgb(179, 38, 30)');
    expect(`${style.textDecoration} ${style.textDecorationLine}`).toMatch(
      /underline/
    );
    // and it lights up with the card around it
    expect(where.closest('[data-ring]')).toHaveAttribute('data-ring', '1');
  }, 20000);

  it('opens on Basics with every section in the nav', () => {
    render();
    // V1's two-word names: the nav has the room, and they say more
    [
      'Job Basics',
      'Execution Options',
      'File Inputs',
      'Arguments',
      'Environment Variables',
      'Scheduler Options',
      'Archiving',
      'Review & Submit',
    ].forEach((label) =>
      expect(screen.getAllByText(label).length).toBeGreaterThan(0)
    );
    // and the top group needs no heading over it
    expect(screen.queryByText('The job')).toBeNull();
    // one section at a time: the review body is not mounted yet
    expect(screen.queryByText(/exact request body/)).not.toBeInTheDocument();
  });

  it('shows the selected queue limits when Execution is opened', () => {
    render();
    // the label appears in the nav and in the mobile jump strip
    fireEvent.click(screen.getAllByText('Execution Options')[0]);
    expect(
      screen.getByText('Execution System & Resources')
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
    fireEvent.click(
      within(screen.getByRole('group', { name: 'Step navigation' })).getByRole(
        'button',
        { name: /Review & Submit/ }
      )
    );
    expect(
      await screen.findByRole('button', { name: /Submit Job/ })
    ).toBeDisabled();

    fireEvent.click(screen.getAllByText('Scheduler Options')[0]);
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
    fireEvent.click(
      within(screen.getByRole('group', { name: 'Step navigation' })).getByRole(
        'button',
        { name: /Review & Submit/ }
      )
    );
    const submitButton = await screen.findByRole('button', {
      name: /Submit Job/,
    });
    await waitFor(() => expect(submitButton).toBeEnabled(), { timeout: 5000 });
  }, 20000);

  it('does not claim ready to submit before the first check lands', async () => {
    render();
    // green on open, corrected a moment later, is exactly backwards
    expect(screen.getByText('checking…')).toBeInTheDocument();
    fireEvent.click(
      within(screen.getByRole('group', { name: 'Step navigation' })).getByRole(
        'button',
        { name: /Review & Submit/ }
      )
    );
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
    fireEvent.click(screen.getAllByText('Review & Submit')[0]);

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
    fireEvent.click(screen.getAllByText('Scheduler Options')[0]);
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
    fireEvent.click(screen.getAllByText('Review & Submit')[0]);

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
    fireEvent.click(screen.getAllByText('Review & Submit')[0]);
    fireEvent.click(
      await screen.findByRole('button', { name: /status.*error.*bad queue/ })
    );

    expect(document.querySelector('pre')?.textContent).toBe(
      '{\n  "status": "error",\n  "message": "bad queue"\n}'
    );
  });

  it('Review & Submit hands you to Review rather than submitting behind your back', async () => {
    render();
    await screen.findByText(/1 to fix/, undefined, { timeout: 5000 });

    fireEvent.click(
      within(screen.getByRole('group', { name: 'Step navigation' })).getByRole(
        'button',
        { name: /Review & Submit/ }
      )
    );
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

  it('rings the Submit button on every Review & Submit press', async () => {
    render();
    await screen.findByText(/1 to fix/, undefined, { timeout: 5000 });

    fireEvent.click(
      within(screen.getByRole('group', { name: 'Step navigation' })).getByRole(
        'button',
        { name: /Review & Submit/ }
      )
    );
    const button = await screen.findByRole('button', { name: /Submit Job/ });
    // the hand-off points: the wrapper is flashing, aimed at the button
    expect(button.parentElement).toHaveAttribute('data-submitflash', '1');
    // pressing it again re-rings rather than doing nothing visible
    fireEvent.click(
      within(screen.getByRole('group', { name: 'Step navigation' })).getByRole(
        'button',
        { name: /Review & Submit/ }
      )
    );
    const again = await screen.findByRole('button', { name: /Submit Job/ });
    expect(again.parentElement).toHaveAttribute('data-submitflash', '2');
    // arriving by any other route stays quiet: the flash clears with its
    // animation
    fireEvent.animationEnd(again.parentElement!);
    expect(
      (await screen.findByRole('button', { name: /Submit Job/ })).parentElement
    ).not.toHaveAttribute('data-submitflash');
  });

  it('sends you to the section that owes it when you press the count', async () => {
    render();
    // the app ships an unfilled -A <<allocation>>, so there is one blocker
    const count = await screen.findByText('1 to fix', undefined, {
      timeout: 5000,
    });
    // the chip says where as well as how many, without a sentence
    expect(count.closest('.MuiChip-root')!.textContent).toContain(
      '1 to fix · Scheduler Options'
    );

    // straight to the section with the problem, not to a list of them
    fireEvent.click(count);
    expect(
      await screen.findByText('step 6 of 8', undefined, { timeout: 5000 })
    ).toBeInTheDocument();
  }, 20000);

  it('rings the problem counts in the nav on the way to Review', async () => {
    render();
    await screen.findByText(/1 to fix/, undefined, { timeout: 5000 });
    const schedulerBadge = () =>
      within(
        screen.getAllByText('Scheduler Options')[0].closest('[role="button"]')!
      )
        .getByText('1')
        .closest('.MuiChip-root');
    expect(schedulerBadge()).not.toHaveAttribute('data-pulse');

    fireEvent.click(
      within(screen.getByRole('group', { name: 'Step navigation' })).getByRole(
        'button',
        { name: /Review & Submit/ }
      )
    );
    await waitFor(() =>
      expect(schedulerBadge()).toHaveAttribute('data-pulse', '1')
    );
  }, 20000);

  it('reads the summary where the preference says, in the nav by default', async () => {
    // the three-way switch left the head line for Settings › Preferences:
    // it is a choice nobody changes twice, and the head line is the
    // scarcest strip in this dialog
    const { unmount } = render();
    expect(screen.queryByText('Summary')).not.toBeInTheDocument();
    const executionRow = () =>
      screen.getAllByText('Execution Options')[0].closest('[role="button"]') as
        | HTMLElement
        | undefined;
    await waitFor(() =>
      expect(executionRow()!.textContent).toContain('Command Prefix')
    );
    expect(executionRow()!.textContent).toContain('frontera');
    // a rule under each block, inset like the pane's, so the sections read as
    // blocks rather than running together
    expect(executionRow()!.querySelector('hr')).not.toBeNull();
    unmount();

    launcherSummary.set('pane');
    const paned = render();
    expect(screen.getByText('Summary')).toBeInTheDocument();
    expect(executionRow()!.textContent).not.toContain('Command Prefix');
    paned.unmount();

    launcherSummary.set('off');
    render();
    expect(screen.queryByText('Summary')).not.toBeInTheDocument();
    expect(executionRow()!.textContent).not.toContain('Command Prefix');
  });

  it('marks a row you have not filled in as not part of the job', () => {
    render();
    fireEvent.click(screen.getAllByText('Arguments')[0]);
    fireEvent.click(screen.getAllByRole('button', { name: '+ Add' })[0]);
    expect(screen.getByText('empty')).toBeInTheDocument();
  });

  const jsonDialog = () =>
    screen.queryByRole('dialog', { name: 'Edit the job as JSON' });

  it('opens the job as JSON in a dialog, and closes back to the same step', async () => {
    render();
    await screen.findByText('step 1 of 8', undefined, { timeout: 5000 });
    fireEvent.click(screen.getByRole('button', { name: 'JSON' }));
    const dialog = await screen.findByRole('dialog', {
      name: 'Edit the job as JSON',
    });
    // it says the job in it is the one built so far, and what editing it does
    expect(
      within(dialog).getByText(/current job is loaded/)
    ).toBeInTheDocument();
    // the editor is lazy (CodeMirror stays out of the eager bundle), so its
    // presses arrive after the chunk; the one that acts waits for an edit
    expect(
      await within(dialog).findByRole(
        'button',
        { name: 'Update the steps' },
        { timeout: 5000 }
      )
    ).toBeDisabled();
    // not a jump: the first step is still the one behind it
    expect(screen.getByText('step 1 of 8')).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole('button', { name: 'Close JSON' }));
    await waitFor(() => expect(jsonDialog()).toBeNull());
    expect(screen.getByText('step 1 of 8')).toBeInTheDocument();

    // the shortcut opens the same dialog
    fireEvent.keyDown(document, { key: 'j', metaKey: true });
    expect(
      await screen.findByRole('dialog', { name: 'Edit the job as JSON' })
    ).toBeInTheDocument();
  });

  it('can take a pasted job into the form from Review', async () => {
    render();
    fireEvent.click(screen.getAllByText('Review & Submit')[0]);

    // preview by default: the request body, in the same reader the detail
    // pages use for a Tapis record, with its own copy press, two levels
    // open so every section of the job reads at a glance
    expect(screen.getByText('Job Definition')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'copy JSON' })
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText('How far the tree opens itself')
    ).toHaveTextContent('2 levels');

    // Review's own way in opens the same dialog the head line does
    fireEvent.click(screen.getByRole('button', { name: 'Edit as JSON' }));
    const dialog = await screen.findByRole('dialog', {
      name: 'Edit the job as JSON',
    });

    const update = await within(dialog).findByRole(
      'button',
      { name: 'Update the steps' },
      { timeout: 5000 }
    );
    // grey until the text says something new: a stray press on the way
    // through cannot rewrite the form
    expect(update).toBeDisabled();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Close JSON' }));
    await waitFor(() => expect(jsonDialog()).toBeNull());
    // one submit path: paste applies to the form, it does not submit on its own
    expect(submit).not.toHaveBeenCalled();
  });

  it('says what the app already declared at the top of args and env', () => {
    render();
    fireEvent.click(screen.getAllByText('Arguments')[0]);
    expect(
      screen.getByText(/2 arguments carried over from flexserv/)
    ).toBeInTheDocument();

    fireEvent.click(screen.getAllByText('Environment Variables')[0]);
    expect(
      screen.getByText(/1 environment variable carried over from flexserv/)
    ).toBeInTheDocument();
  });

  it('says so in a note when the app declares no file inputs', () => {
    render();
    fireEvent.click(screen.getAllByText('File Inputs')[0]);
    const note = screen.getByText(/does not declare any file inputs/);
    // the launcher's one-line note, not a pastel MUI Alert
    expect(note.closest('.MuiAlert-root')).toBeNull();
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
    fireEvent.click(screen.getAllByText('Scheduler Options')[0]);

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
      .getAllByText('Scheduler Options')[0]
      .closest('[role="button"]') as HTMLElement;
    // the summary rides in the nav row by default now, so the row carries
    // the section's facts too — the badge is what this test is about
    expect(schedulerRow.textContent).toMatch(/^Scheduler Options1(?!\d)/);

    fireEvent.click(screen.getByRole('button', { name: 'Include it' }));
    expect(screen.queryByText(/will not be sent/)).not.toBeInTheDocument();
    // the flag is its own cell now, with the value beside it
    expect(screen.getByText('--reservation')).toBeInTheDocument();
    expect((reservation as HTMLInputElement).value).toBe('maintenance-42');
  });

  it('flags the offending section in the nav, and clears it once fixed', async () => {
    render();
    const schedulerRow = screen
      .getAllByText('Scheduler Options')[0]
      .closest('[role="button"]') as HTMLElement;

    // red tally of problems on the row that owns the unresolved -A placeholder
    await screen.findByText(/1 to fix/, undefined, { timeout: 5000 });
    // the summary rides in the nav row by default now, so the row carries
    // the section's facts too — the badge is what this test is about
    expect(schedulerRow.textContent).toMatch(/^Scheduler Options1(?!\d)/);

    fireEvent.click(screen.getAllByText('Scheduler Options')[0]);
    const allocationInput = screen.getByLabelText(/Allocation \(project\)/);
    fireEvent.change(allocationInput, { target: { value: 'MY-PROJECT-1' } });
    fireEvent.blur(allocationInput);

    // back to the quiet count of included flags — two of them, so this is a
    // different number than the error tally it replaced
    await screen.findByText(/ready to submit/, undefined, { timeout: 5000 });
    // the nav badge runs on its own debounce, a beat behind the header
    await waitFor(
      () =>
        expect(schedulerRow.textContent).toMatch(/^Scheduler Options2(?!\d)/),
      { timeout: 5000 }
    );
    // nav badge and the summary pane both name the system
    expect(screen.getAllByText('frontera').length).toBeGreaterThan(0);
  }, 20000);

  it('says in the nav what is wrong, not only how much', async () => {
    render();
    const schedulerRow = () =>
      screen.getAllByText('Scheduler Options')[0].closest('[role="button"]') as
        | HTMLElement
        | undefined;

    // a count tells you a section is wrong; the point of an overview is to
    // know WHICH thing is wrong without opening it. Three scheduler flags
    // read the same as "this value", so the row names the one that is wrong
    await waitFor(
      () =>
        expect(schedulerRow()!.textContent).toContain(
          'Allocation (project) is still a placeholder'
        ),
      { timeout: 5000 }
    );
    // ...and the second sentence of the message stays on the review board:
    // a nav row has no room for the instruction as well
    expect(schedulerRow()!.textContent).not.toContain('uncheck Include');

    // an amber issue reaches the row too, and reads as the flag that will go
    // missing rather than as the field that holds it
    fireEvent.click(screen.getAllByText('Scheduler Options')[0]);
    const reservation = screen.getByLabelText(
      /Reservation name/
    ) as HTMLInputElement;
    fireEvent.change(reservation, { target: { value: 'maintenance-42' } });
    fireEvent.blur(reservation);
    await waitFor(
      () =>
        expect(schedulerRow()!.textContent).toContain(
          '--reservation set but not included'
        ),
      { timeout: 5000 }
    );

    // fixing it takes the line off the row, so the nav never keeps a stale
    // complaint the form has already answered
    const allocation = screen.getByLabelText(/Allocation \(project\)/);
    fireEvent.change(allocation, { target: { value: 'MY-PROJECT-1' } });
    fireEvent.blur(allocation);
    await waitFor(
      () =>
        expect(schedulerRow()!.textContent).not.toContain(
          'is still a placeholder'
        ),
      { timeout: 5000 }
    );
  }, 20000);

  it('keeps one pager for the whole walk, under the nav it walks', async () => {
    render();
    await screen.findByText('step 1 of 8', undefined, { timeout: 5000 });
    // under the section list, not in a section's head line: the list runs
    // top to bottom and the pager is the foot of it, so Continue points down
    const pagers = screen.getAllByRole('group', { name: 'Step navigation' });
    expect(pagers).toHaveLength(1);
    expect(pagers[0].closest('nav')).not.toBeNull();
    expect(
      within(pagers[0]).getByTestId('KeyboardArrowDownRoundedIcon')
    ).toBeTruthy();
  }, 20000);

  it('walks down the list on presses that stay put', async () => {
    render();
    await screen.findByText('step 1 of 8', undefined, { timeout: 5000 });
    const pager = screen.getByRole('group', { name: 'Step navigation' });
    const back = within(pager).getByRole('button', { name: 'Back' });
    // Continue always reads Continue; where it goes is its accessible name
    // and its tooltip, so it can be pressed without being read
    const next = within(pager).getByRole('button', {
      name: 'Continue to Execution Options',
    });
    expect(next).toHaveTextContent(/^Continue$/);
    expect(back).toBeDisabled();

    // Two presses on the same spot walk two sections. The panel renders the
    // pager once, so these are the same buttons on every step and the second
    // press lands where the first one did.
    fireEvent.click(next);
    await screen.findByText('step 2 of 8', undefined, { timeout: 5000 });
    expect(next).toHaveAttribute('aria-label', 'Continue to File Inputs');
    fireEvent.click(next);
    await screen.findByText('step 3 of 8', undefined, { timeout: 5000 });
    expect(screen.getByRole('group', { name: 'Step navigation' })).toBe(pager);

    // Back is the one above, and goes back up the list
    expect(back).toHaveAttribute('aria-label', 'Back to Execution Options');
    fireEvent.click(back);
    expect(
      await screen.findByText('step 2 of 8', undefined, { timeout: 5000 })
    ).toBeInTheDocument();
  }, 25000);

  it('continues in the launch blue, with the way straight to review under it', async () => {
    render();
    await screen.findByText('step 1 of 8', undefined, { timeout: 5000 });
    const pager = screen.getByRole('group', { name: 'Step navigation' });
    // the same blue as the app page's Submit job: one colour for the press
    // that moves the job on
    const blue = window.getComputedStyle(
      within(pager).getByRole('button', {
        name: 'Continue to Execution Options',
      })
    ).backgroundColor;
    expect(['rgb(21, 101, 192)', '#1565c0']).toContain(blue);

    // V1's Skip to End, as the small blue press under Continue
    fireEvent.click(
      within(pager).getByRole('button', { name: /Review & Submit/ })
    );
    expect(
      await screen.findByText('step 8 of 8', undefined, { timeout: 5000 })
    ).toBeInTheDocument();
    // the same label in the same place on Review too, where it rings Submit
    // again; the forward press is shut rather than gone
    const last = screen.getByRole('group', { name: 'Step navigation' });
    expect(
      within(last).getByRole('button', { name: /Review & Submit/ })
    ).toBeInTheDocument();
    expect(
      within(last).getByRole('button', { name: 'Continue' })
    ).toBeDisabled();
  }, 20000);

  it('leaves the section head line to the section', async () => {
    render();
    fireEvent.click(screen.getAllByText('Execution Options')[0]);
    await screen.findByText('step 2 of 8', undefined, { timeout: 5000 });
    // title block, then the strip that holds it and the chip
    const header = screen
      .getByText('Execution System & Resources')
      .closest('div')!.parentElement!.parentElement as HTMLElement;
    // the chip reads "on frontera": an id on its own is an answer to a
    // question the chip does not ask
    const chip = screen.getByText('on frontera').closest('.MuiChip-root')!;
    expect(header.contains(chip)).toBe(true);
    // and nothing in the strip is a press: the walk lives under the nav, so
    // the head line has nothing in it to move under a reaching hand
    expect(within(header).queryAllByRole('button')).toHaveLength(0);
  }, 20000);

  it('pages on the wheel as well as the buttons', async () => {
    render();
    await screen.findByText('step 1 of 8', undefined, { timeout: 5000 });
    // three flicks' worth past the end of the form, the launcher's setting,
    // and the pager follows whichever way the section changed
    const field = screen.getAllByRole('textbox')[0];
    for (let i = 0; i < 5; i += 1) {
      fireEvent.wheel(field, { deltaY: 120 });
    }
    expect(
      await screen.findByText('step 2 of 8', undefined, { timeout: 5000 })
    ).toBeInTheDocument();
  }, 20000);

  it('switches the in-nav summary from the pager', async () => {
    render();
    await screen.findByText('step 1 of 8', undefined, { timeout: 5000 });
    const toggle = () =>
      within(screen.getByRole('group', { name: 'Step navigation' })).getByRole(
        'button',
        { name: 'Summary in the nav' }
      );
    expect(toggle().closest('nav')).not.toBeNull();
    expect(toggle()).toHaveAttribute('aria-pressed', 'true');

    // the same preference Settings writes, so the two cannot disagree
    fireEvent.click(toggle());
    expect(launcherSummary.get()).toBe('off');
    await waitFor(() =>
      expect(toggle()).toHaveAttribute('aria-pressed', 'false')
    );
    fireEvent.click(toggle());
    expect(launcherSummary.get()).toBe('nav');
  }, 20000);

  it('says the count once on Review, not twice over', async () => {
    render();
    fireEvent.click(screen.getAllByText('Review & Submit')[0]);
    await screen.findByText(
      /thing to fix before this job can be submitted/,
      undefined,
      {
        timeout: 5000,
      }
    );
    // the board counts them in a sentence; a chip over the top of it was a
    // second copy of the same number on the same screen
    expect(screen.queryByText('1 to fix')).toBeInTheDocument();
    const chips = screen.queryAllByText('1 to fix');
    expect(chips).toHaveLength(1);
  }, 20000);

  it('gathers blockers and warnings into one board on Review', async () => {
    render();
    fireEvent.click(screen.getAllByText('Scheduler Options')[0]);
    const reservation = screen.getByLabelText(
      /Reservation name/
    ) as HTMLInputElement;
    fireEvent.change(reservation, { target: { value: 'maintenance-42' } });
    fireEvent.blur(reservation);

    fireEvent.click(screen.getAllByText('Review & Submit')[0]);
    const red = await screen.findByText(
      /thing to fix before this job can be submitted/,
      undefined,
      { timeout: 5000 }
    );
    const amber = await screen.findByText(/will not be sent/, undefined, {
      timeout: 5000,
    });

    // The two severities used to be two separate boxes with the submit row
    // between them and the request body below; the smallest thing containing
    // both of them was the whole section. Now they are one card, so the
    // smallest thing containing both stops well short of the button.
    let card: HTMLElement = red;
    while (!card.contains(amber)) {
      card = card.parentElement as HTMLElement;
    }
    expect(card.textContent).not.toContain('Submit Job');
    // red heads the card: a warning does not block a submission, so it can
    // never be the first thing the board says
    expect(card.textContent).toMatch(
      /to fix before this job can be submitted[\s\S]*will not be sent/
    );
    // and neither half offers to change the form for you: the board says
    // what is wrong, and each row's label goes to the section that can fix it
    expect(
      within(card).queryByRole('button', { name: /Uncheck Include|Include it/ })
    ).toBeNull();
  }, 20000);

  it('rings the list of what is left along with Submit', async () => {
    render();
    await screen.findByText(/1 to fix/, undefined, { timeout: 5000 });
    const board = () =>
      screen
        .getByText(/thing to fix before this job can be submitted/)
        .closest('[data-ring]');

    fireEvent.click(
      within(screen.getByRole('group', { name: 'Step navigation' })).getByRole(
        'button',
        { name: /Review & Submit/ }
      )
    );
    await waitFor(() => expect(board()).toHaveAttribute('data-ring', '1'));
    // pressing again rings it again rather than doing nothing visible
    fireEvent.click(
      within(screen.getByRole('group', { name: 'Step navigation' })).getByRole(
        'button',
        { name: /Review & Submit/ }
      )
    );
    await waitFor(() => expect(board()).toHaveAttribute('data-ring', '2'));
  }, 20000);

  it('refuses a submit that the debounced list had not caught yet', async () => {
    render();
    fireEvent.click(screen.getAllByText('Scheduler Options')[0]);
    const allocationField = screen.getByLabelText(/Allocation \(project\)/);
    fireEvent.change(allocationField, { target: { value: 'MY-PROJECT-1' } });
    fireEvent.blur(allocationField);
    await screen.findByText(/ready to submit/, undefined, { timeout: 5000 });
    await new Promise((resolve) => setTimeout(resolve, 800));
    fireEvent.click(
      within(screen.getByRole('group', { name: 'Step navigation' })).getByRole(
        'button',
        { name: /Review & Submit/ }
      )
    );
    const submitButton = await screen.findByRole('button', {
      name: /Submit Job/,
    });
    await waitFor(() => expect(submitButton).toBeEnabled(), { timeout: 5000 });
    // the list behind the button is settled and clean; the form now is not
    const real = blockers.computeBlockers;
    const spy = jest
      .spyOn(blockers, 'computeBlockers')
      .mockImplementation((args) => [
        ...real(args),
        {
          sectionId: 'scheduler',
          label: '-A-empty',
          message: 'Allocation is included but has no value.',
          short: 'Allocation is included but empty',
        },
      ]);
    fireEvent.click(submitButton);
    expect(
      await screen.findByText('The job was not submitted', undefined, {
        timeout: 5000,
      })
    ).toBeInTheDocument();
    expect(
      screen.getAllByText(/Allocation is included but has no value/).length
    ).toBeGreaterThan(0);
    expect(submit).not.toHaveBeenCalled();
    spy.mockRestore();
  }, 20000);

  it('submits the assembled job with numbers coerced', async () => {
    render();
    fireEvent.click(screen.getAllByText('Scheduler Options')[0]);
    const allocationField = screen.getByLabelText(/Allocation \(project\)/);
    fireEvent.change(allocationField, { target: { value: 'MY-PROJECT-1' } });
    fireEvent.blur(allocationField);
    await screen.findByText(/ready to submit/, undefined, { timeout: 5000 });
    // 'ready' also shows before the first check is read back, so let the
    // validation debounce and the list's own pass go by, then ask again
    await new Promise((resolve) => setTimeout(resolve, 800));
    await waitFor(() => expect(screen.queryByText(/to fix/)).toBeNull(), {
      timeout: 5000,
    });
    fireEvent.click(
      within(screen.getByRole('group', { name: 'Step navigation' })).getByRole(
        'button',
        { name: /Review & Submit/ }
      )
    );
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
    fireEvent.click(screen.getAllByText('Scheduler Options')[0]);

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
    fireEvent.click(screen.getAllByText('Scheduler Options')[0]);
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

    expect(screen.getByText('App Arguments')).toBeInTheDocument();
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

  const openEnv = () =>
    fireEvent.click(screen.getAllByText('Environment Variables')[0]);

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
    const description = screen.getByDisplayValue(
      'Password for the results database'
    );
    // a labelled, bordered field, not a caption that reads as plain text
    expect(description).toHaveClass('row-input');
    expect(screen.getByText('description')).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole('button', { name: /Collapse descriptions/ })
    );
    expect(
      screen.queryByDisplayValue('Password for the results database')
    ).not.toBeInTheDocument();
  });

  it('opens the descriptions when you add a variable of your own', () => {
    // a row you add is one you are writing, description included, so it
    // should not sit behind a toggle you have to find first
    withEnv([]);
    render();
    openEnv();
    fireEvent.click(screen.getByRole('button', { name: '+ Add' }));
    expect(
      screen.getByRole('textbox', { name: 'description' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Collapse descriptions/ })
    ).toBeInTheDocument();
  });

  it('opens the descriptions when you add an argument of your own', () => {
    render();
    fireEvent.click(screen.getAllByText('Arguments')[0]);
    expect(screen.queryAllByRole('textbox', { name: 'description' })).toEqual(
      []
    );
    fireEvent.click(screen.getAllByRole('button', { name: '+ Add' })[0]);
    expect(
      screen.getAllByRole('textbox', { name: 'description' }).length
    ).toBeGreaterThan(0);
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
