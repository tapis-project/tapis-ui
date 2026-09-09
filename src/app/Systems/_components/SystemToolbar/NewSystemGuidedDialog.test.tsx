import React from 'react';
import { fireEvent, screen, within } from '@testing-library/react';
import renderComponent from 'testing/utils';
import { Systems as Hooks } from '@tapis/tapisui-hooks';
import NewSystemGuidedDialog, {
  applySystemType,
  assembleSystem,
  systemProblems,
  EMPTY_SYSTEM,
  EMPTY_QUEUE,
  SYSTEM_TYPE_PRESETS,
} from './NewSystemGuidedDialog';
import { Systems } from '@tapis/tapis-typescript';
import {
  getNewSystemDialogMode,
  resetNewSystemDialogMode,
  setNewSystemDialogMode,
} from '../newSystemDialogPref';

jest.mock('@tapis/tapisui-hooks');

const draft = (over: object = {}) => ({
  ...EMPTY_SYSTEM,
  id: 'my-host',
  host: 'my.host.edu',
  ...over,
});

describe('systemProblems', () => {
  it('a complete draft passes; a bare one names the gaps', () => {
    expect(systemProblems(draft())).toEqual({});
    const bare = systemProblems(draft({ id: '', host: '' }));
    expect(Object.keys(bare).sort()).toEqual(['host', 'id']);
  });

  it('scope follows the toggles — batch rules only bind when batch is on', () => {
    expect(
      systemProblems(draft({ batchSchedulerProfile: '' })).batchSchedulerProfile
    ).toBeDefined();
    expect(
      systemProblems(draft({ batchSchedulerProfile: '', canRunBatch: false }))
    ).toEqual({});
    // a queue without names blocks; a named one passes
    expect(
      systemProblems(draft({ queues: [{ ...EMPTY_QUEUE }] }))['queue-0']
    ).toBeDefined();
    expect(
      systemProblems(
        draft({
          queues: [{ ...EMPTY_QUEUE, name: 'normal', hpcQueueName: 'n' }],
        })
      )
    ).toEqual({});
  });
});

describe('rows that assembleSystem would drop', () => {
  it('flags a blank env key, a blank capability name and a repeated queue', () => {
    const q = { ...EMPTY_QUEUE, name: 'normal', hpcQueueName: 'normal' };
    const p = systemProblems(
      draft({
        envVars: [{ key: '', value: 'x', description: '' }],
        capabilities: [
          { category: 'SCHEDULER', name: '', value: '', precedence: '' },
        ],
        queues: [q, { ...q }],
      })
    );
    expect(p['envvar-0']).toBeDefined();
    expect(p['capname-0']).toBeDefined();
    expect(p['queue-0']).toBeUndefined();
    expect(p['queue-1']).toMatch(/repeated/);
  });

  it('does not flag them when exec is off, where they are not sent', () => {
    const p = systemProblems(
      draft({
        canExec: false,
        canRunBatch: false,
        envVars: [{ key: '', value: '', description: '' }],
      })
    );
    expect(p['envvar-0']).toBeUndefined();
  });
});

describe('assembleSystem', () => {
  it('a storage-only system says so and carries no exec noise', () => {
    const req = assembleSystem(
      draft({ canExec: false, canRunBatch: true })
    ) as any;
    expect(req.canExec).toBe(false);
    expect(req.canRunBatch).toBe(false);
    expect(req.jobWorkingDir).toBeUndefined();
    expect(req.batchScheduler).toBeUndefined();
  });

  it('queues, env vars and capabilities land with numbers as numbers', () => {
    const req = assembleSystem(
      draft({
        envVars: [{ key: 'FOO', value: 'bar' }],
        capabilities: [{ category: 'HARDWARE', name: 'gpu', value: 'a100' }],
        queues: [
          {
            ...EMPTY_QUEUE,
            name: 'normal',
            hpcQueueName: 'normal-q',
            maxNodeCount: '64',
            maxMinutes: '2880',
          },
        ],
        batchDefaultLogicalQueue: 'normal',
      })
    ) as any;
    expect(req.jobEnvVariables).toEqual([{ key: 'FOO', value: 'bar' }]);
    expect(req.jobCapabilities).toEqual([
      { category: 'HARDWARE', name: 'gpu', value: 'a100' },
    ]);
    expect(req.batchLogicalQueues).toEqual([
      {
        name: 'normal',
        hpcQueueName: 'normal-q',
        maxNodeCount: 64,
        maxMinutes: 2880,
      },
    ]);
    expect(req.batchDefaultLogicalQueue).toBe('normal');
  });
});

describe('the guided dialog', () => {
  let createSystem: jest.Mock;
  beforeEach(() => {
    jest.clearAllMocks();
    createSystem = jest.fn().mockResolvedValue({});
    (Hooks.useCreateSystem as jest.Mock).mockReturnValue({
      createSystem,
      isLoading: false,
      isSuccess: false,
      error: null,
      reset: jest.fn(),
    });
    (Hooks.useSchedulerProfiles as jest.Mock).mockReturnValue({
      data: { result: [{ name: 'tacc' }, { name: 'tacc-apptainer' }] },
      isLoading: false,
      error: null,
    });
    (Hooks.queryKeys as any) = {
      list: 'systems/list',
      listWindow: 'systems/listWindow',
    };
  });

  it('walks identity → host → review and sends the assembled system', () => {
    renderComponent(<NewSystemGuidedDialog onClose={jest.fn()} />);
    fireEvent.change(screen.getByLabelText(/System id/), {
      target: { value: 'my-host' },
    });
    fireEvent.click(screen.getAllByText('Host')[0]);
    fireEvent.change(screen.getByLabelText(/^Host/), {
      target: { value: 'my.host.edu' },
    });
    fireEvent.click(screen.getAllByText('Review & Create')[0]);
    expect(screen.getByText(/exact request/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Create system/ }));
    expect(createSystem).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'my-host',
        host: 'my.host.edu',
        canExec: true,
        canRunBatch: true,
        batchSchedulerProfile: 'tacc',
      }),
      true,
      expect.anything()
    );
  });

  it('closes a pristine form at once and asks before discarding typed work', () => {
    const onClose = jest.fn();
    const { unmount } = renderComponent(
      <NewSystemGuidedDialog onClose={onClose} />
    );
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
    unmount();

    onClose.mockClear();
    renderComponent(<NewSystemGuidedDialog onClose={onClose} />);
    fireEvent.change(screen.getByLabelText(/System id/), {
      target: { value: 'my-host' },
    });
    fireEvent.keyDown(screen.getAllByRole('dialog')[0], { key: 'Escape' });
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByText('Discard this system?')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Cancel'));
    expect(onClose).not.toHaveBeenCalled();
    fireEvent.click(screen.getByLabelText(/^Close /));
    fireEvent.click(screen.getByText('Discard'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('create stays shut while required fields are missing', () => {
    renderComponent(<NewSystemGuidedDialog onClose={jest.fn()} />);
    fireEvent.click(screen.getAllByText('Review & Create')[0]);
    expect(
      screen.getByRole('button', { name: /Create system/ })
    ).toBeDisabled();
  });

  it("this tenant's real profiles are offered as chips", () => {
    renderComponent(<NewSystemGuidedDialog onClose={jest.fn()} />);
    fireEvent.click(screen.getAllByText('Batch')[0]);
    fireEvent.click(screen.getByText('tacc-apptainer'));
    fireEvent.click(screen.getAllByText('Review & Create')[0]);
    // the review shows the request in the record reader the detail pages
    // use, so the key and its value are their own elements
    expect(screen.getByText('batchSchedulerProfile')).toBeInTheDocument();
    expect(screen.getByText('"tacc-apptainer"')).toBeInTheDocument();
  });
});

describe('system types', () => {
  it('carries the type defaults with the type', () => {
    const moved = applySystemType(draft(), Systems.SystemTypeEnum.Irods);
    expect(moved.port).toBe('1247');
    expect(moved.defaultAuthnMethod).toBe(Systems.AuthnEnum.Password);
    expect(moved.rootDir).toBe('/tempZone/home');
    // storage has no shell, so exec is not a preference here
    expect(moved.canExec).toBe(false);
  });

  it('does not throw away a value the reader chose', () => {
    const mine = draft({ port: '2222', rootDir: '/work' });
    const moved = applySystemType(mine, Systems.SystemTypeEnum.Irods);
    expect(moved.port).toBe('2222');
    expect(moved.rootDir).toBe('/work');
  });

  it('drops a bucket that no longer means anything', () => {
    const s3 = applySystemType(draft(), Systems.SystemTypeEnum.S3);
    const withBucket = { ...s3, bucketName: 'my-bucket' };
    expect(
      applySystemType(withBucket, Systems.SystemTypeEnum.Linux).bucketName
    ).toBe('');
  });

  it('asks for the one field the service will not infer', () => {
    const s3 = applySystemType(draft(), Systems.SystemTypeEnum.S3);
    expect(systemProblems(s3).bucketName).toBeDefined();
    expect(
      systemProblems({ ...s3, bucketName: 'my-bucket' }).bucketName
    ).toBeUndefined();
    // and a bucket on a Linux system is not asked for, nor sent
    expect(
      systemProblems(draft({ bucketName: '' })).bucketName
    ).toBeUndefined();
    expect(
      (assembleSystem(draft({ bucketName: 'stray' })) as any).bucketName
    ).toBeUndefined();
  });

  it('every type has a worked example, and the example is of that type', () => {
    Object.values(Systems.SystemTypeEnum).forEach((type) => {
      const preset = SYSTEM_TYPE_PRESETS[type];
      expect(preset.example.host).toBeTruthy();
      expect(preset.example.rootDir).toBeTruthy();
      expect(preset.port).toMatch(/^\d+$/);
    });
    // only S3 carries a bucket, because only S3 has one
    expect(
      SYSTEM_TYPE_PRESETS[Systems.SystemTypeEnum.S3].example.bucketName
    ).toBeTruthy();
    expect(
      SYSTEM_TYPE_PRESETS[Systems.SystemTypeEnum.Linux].example.bucketName
    ).toBeUndefined();
  });
});

describe('the fields the classic wizard had', () => {
  it('sends port, owner, enabled, allowChildren and the sub-field extras', () => {
    const req = assembleSystem(
      draft({
        port: '2222',
        owner: 'someone-else',
        enabled: false,
        allowChildren: true,
        envVars: [{ key: 'FOO', value: 'bar', description: 'why' }],
        capabilities: [
          {
            category: 'HARDWARE',
            name: 'gpu',
            value: 'a100',
            precedence: '10',
          },
        ],
      })
    ) as any;
    expect(req.port).toBe(2222);
    expect(req.owner).toBe('someone-else');
    expect(req.enabled).toBe(false);
    expect(req.allowChildren).toBe(true);
    expect(req.jobEnvVariables).toEqual([
      { key: 'FOO', value: 'bar', description: 'why' },
    ]);
    expect(req.jobCapabilities).toEqual([
      { category: 'HARDWARE', name: 'gpu', value: 'a100', precedence: 10 },
    ]);
  });

  it('never puts a NaN on the wire', () => {
    // NaN survives an object but JSON.stringify writes it as null, which is a
    // field sent wrong rather than a field left out
    const req = assembleSystem(
      draft({ port: 'not a port', jobMaxJobs: 'lots' })
    ) as any;
    expect(req.port).toBeUndefined();
    expect(req.jobMaxJobs).toBeUndefined();
  });

  it('-1 is a port, because that is how Tapis says the protocol default', () => {
    expect(systemProblems(draft({ port: '-1' })).port).toBeUndefined();
    expect(systemProblems(draft({ port: '70000' })).port).toBeDefined();
    expect(systemProblems(draft({ port: 'ssh' })).port).toBeDefined();
  });
});

describe('the guided dialog, beside the apps wizard', () => {
  beforeEach(() => {
    (Hooks.useSchedulerProfiles as jest.Mock).mockReturnValue({
      data: { result: [] },
      isLoading: false,
      error: null,
    });
    (Hooks.useCreateSystem as jest.Mock).mockReturnValue({
      createSystem: jest.fn(),
      isLoading: false,
      isSuccess: false,
      error: null,
      reset: jest.fn(),
    });
  });

  it('can be dragged bigger, the way the launcher can', () => {
    renderComponent(<NewSystemGuidedDialog onClose={jest.fn()} />);
    expect(screen.getByTitle('Drag to resize')).toBeInTheDocument();
  });

  it('says what is left in the head line, and names where it starts', () => {
    renderComponent(<NewSystemGuidedDialog onClose={jest.fn()} />);
    const count = screen.getByText(/to fix/);
    // the count, then where the first of it lives, in one chip
    expect(count.closest('.MuiChip-root')!.textContent).toMatch(
      /to fix · Identity/
    );
  });

  it('carries the summary into the nav rows', () => {
    renderComponent(<NewSystemGuidedDialog onClose={jest.fn()} />);
    const hostRow = screen
      .getAllByText('Host')[0]
      .closest('[role="button"]') as HTMLElement;
    // the type, the port and the auth method read from the row itself
    expect(hostRow.textContent).toContain('LINUX');
    expect(hostRow.textContent).toContain(':22');
    expect(hostRow.textContent).toContain('PKI_KEYS');
  });

  it('gathers every gap onto the review board, each a press to its step', () => {
    renderComponent(<NewSystemGuidedDialog onClose={jest.fn()} />);
    fireEvent.click(screen.getAllByText('Review & Create')[0]);
    expect(
      screen.getByText(/to fix before this system can be created/)
    ).toBeInTheDocument();
    // the id is missing on a blank draft. It says so twice on purpose: once
    // on the Identity nav row, once on the board, which is the whole point of
    // an overview that agrees with the review
    expect(screen.getAllByText('a system needs an id')).toHaveLength(2);
    expect(screen.getAllByTitle('Go to Identity').length).toBeGreaterThan(0);
  });
});

describe('the preference', () => {
  afterEach(() => resetNewSystemDialogMode());

  it('defaults to guided, remembers classic, resets', () => {
    expect(getNewSystemDialogMode()).toBe('guided');
    setNewSystemDialogMode('classic');
    expect(getNewSystemDialogMode()).toBe('classic');
    expect(window.localStorage.getItem('systems.newSystemDialog')).toBe(
      'classic'
    );
    resetNewSystemDialogMode();
    expect(getNewSystemDialogMode()).toBe('guided');
  });
});

describe('the numbered walk', () => {
  // this block used to lean on whichever describe ran before it having left
  // the hook mocks set; under a full run that is not a promise anyone made
  beforeEach(() => {
    (Hooks.useSchedulerProfiles as jest.Mock).mockReturnValue({
      data: { result: [] },
      isLoading: false,
      error: null,
    });
    (Hooks.useCreateSystem as jest.Mock).mockReturnValue({
      createSystem: jest.fn(),
      isLoading: false,
      isSuccess: false,
      error: null,
      reset: jest.fn(),
    });
  });

  it('numbers the steps the way the classic creator did', async () => {
    renderComponent(<NewSystemGuidedDialog onClose={jest.fn()} />);
    await screen.findByText('step 1 of 5');
    // the nav lists these too, so scope to the stepper across the top
    const stepper = document.querySelector('.MuiStepper-root');
    expect(stepper).toBeTruthy();
    ['Identity', 'Host', 'Execution', 'Batch', 'Review & Create'].forEach(
      (label) => expect(stepper).toHaveTextContent(label)
    );
  });

  it('walks forward and back from the pager under the nav', async () => {
    renderComponent(<NewSystemGuidedDialog onClose={jest.fn()} />);
    await screen.findByText('step 1 of 5');
    const pager = () => screen.getByRole('group', { name: 'Step navigation' });

    fireEvent.click(
      within(pager()).getByRole('button', { name: 'Continue to Host' })
    );
    expect(await screen.findByText('step 2 of 5')).toBeInTheDocument();
    fireEvent.click(
      within(pager()).getByRole('button', { name: /Back to Identity/ })
    );
    expect(await screen.findByText('step 1 of 5')).toBeInTheDocument();
  });

  it('shuts Back on the first step rather than hiding it', async () => {
    renderComponent(<NewSystemGuidedDialog onClose={jest.fn()} />);
    await screen.findByText('step 1 of 5');
    // present but disabled: a control that vanishes moves everything under
    // it, and Continue sits right under this one
    expect(screen.getByRole('button', { name: 'Back' })).toBeDisabled();
  });

  it('keeps the overview in the body, not over the sidebar', async () => {
    renderComponent(<NewSystemGuidedDialog onClose={jest.fn()} />);
    await screen.findByText('step 1 of 5');
    const stepper = document.querySelector('.MuiStepper-root') as HTMLElement;
    // the panel's banner slot spans the nav column as well, so the stepper
    // living there pushed every section row down; it belongs to the step
    const scroller = stepper.closest('[class*="MuiBox-root"]');
    expect(scroller).toBeTruthy();
    // the nav list and the stepper are not the same subtree
    const navRow = screen
      .getAllByText('Identity')[0]
      .closest('[role="button"]');
    expect(navRow && stepper.contains(navRow)).toBeFalsy();
    expect(navRow?.contains(stepper)).toBeFalsy();
  });

  it('reaches the last step, which shuts Continue and can still walk back', async () => {
    renderComponent(<NewSystemGuidedDialog onClose={jest.fn()} />);
    const pager = () => screen.getByRole('group', { name: 'Step navigation' });
    await screen.findByText('step 1 of 5');
    for (const next of ['Host', 'Execution', 'Batch', 'Review & Create']) {
      fireEvent.click(
        within(pager()).getByRole('button', { name: `Continue to ${next}` })
      );
    }
    expect(await screen.findByText('step 5 of 5')).toBeInTheDocument();
    // the forward press is shut rather than gone
    expect(
      within(pager()).getByRole('button', { name: 'Continue' })
    ).toBeDisabled();
    expect(
      within(pager()).getByRole('button', { name: /Back to Batch/ })
    ).toBeEnabled();
  });

  it('skips straight to review from any step', async () => {
    renderComponent(<NewSystemGuidedDialog onClose={jest.fn()} />);
    await screen.findByText('step 1 of 5');
    fireEvent.click(
      within(screen.getByRole('group', { name: 'Step navigation' })).getByRole(
        'button',
        { name: 'Review & Create' }
      )
    );
    expect(await screen.findByText('step 5 of 5')).toBeInTheDocument();
  });
});
