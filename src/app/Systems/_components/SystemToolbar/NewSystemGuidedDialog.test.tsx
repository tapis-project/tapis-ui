import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import renderComponent from 'testing/utils';
import { Systems as Hooks } from '@tapis/tapisui-hooks';
import NewSystemGuidedDialog, {
  assembleSystem,
  systemProblems,
  EMPTY_SYSTEM,
  EMPTY_QUEUE,
} from './NewSystemGuidedDialog';
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
    fireEvent.click(screen.getAllByText('Review & create')[0]);
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

  it('create stays shut while required fields are missing', () => {
    renderComponent(<NewSystemGuidedDialog onClose={jest.fn()} />);
    fireEvent.click(screen.getAllByText('Review & create')[0]);
    expect(
      screen.getByRole('button', { name: /Create system/ })
    ).toBeDisabled();
  });

  it("this tenant's real profiles are offered as chips", () => {
    renderComponent(<NewSystemGuidedDialog onClose={jest.fn()} />);
    fireEvent.click(screen.getAllByText('Batch')[0]);
    fireEvent.click(screen.getByText('tacc-apptainer'));
    fireEvent.click(screen.getAllByText('Review & create')[0]);
    expect(
      screen.getByText(/"batchSchedulerProfile": "tacc-apptainer"/)
    ).toBeInTheDocument();
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
