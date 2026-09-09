import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import renderComponent from 'testing/utils';
import { Apps, Systems } from '@tapis/tapis-typescript';
import {
  Apps as AppsHooks,
  Jobs as JobsHooks,
  Systems as SystemsHooks,
} from '@tapis/tapisui-hooks';
import JobLauncherV2 from './JobLauncherV2';

jest.mock('@tapis/tapisui-hooks');

// Typing latency benchmark for a realistically heavy app (FlexServ carries 13
// app arguments and 9 environment variables). jsdom numbers are not browser
// numbers — no layout, no paint — but they do capture React render work and
// yup validation, which is what a keystroke here pays for. Run explicitly:
//   node node_modules/jest/bin/jest.js perf.bench --testMatch='**/perf.bench.test.tsx'

const system = {
  id: 'frontera',
  canRunBatch: true,
  batchDefaultLogicalQueue: 'normal',
  batchLogicalQueues: [{ name: 'normal', hpcQueueName: 'normal' }],
} as Systems.TapisSystem;

const appArgs = Array.from({ length: 13 }, (_, index) => ({
  name: `appArg${index}`,
  arg: `--flag-${index} value-${index}`,
  inputMode: Apps.ArgInputModeEnum.IncludeByDefault,
}));

const envVariables = Array.from({ length: 9 }, (_, index) => ({
  key: `VAR_${index}`,
  value: `value-${index}`,
}));

const app = {
  id: 'flexserv',
  version: '1.4.0',
  jobType: Apps.JobTypeEnum.Batch,
  jobAttributes: {
    execSystemId: 'frontera',
    parameterSet: {
      appArgs,
      envVariables,
      schedulerOptions: [
        {
          name: 'TACC Allocation',
          arg: '-A MY-PROJECT',
          inputMode: Apps.ArgInputModeEnum.IncludeByDefault,
        },
      ],
    },
  },
} as Apps.TapisApp;

const mockHooks = () => {
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
    reset: jest.fn(),
  });
};

const KEYSTROKES = 20;

const time = (label: string, run: () => void) => {
  const start = performance.now();
  run();
  const elapsed = performance.now() - start;
  // eslint-disable-next-line no-console
  console.log(`${label}: ${elapsed.toFixed(0)}ms total`);
  return elapsed;
};

describe('launcher typing latency', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockHooks();
  });

  it('measures a mount and a burst of keystrokes', () => {
    const mount = time('mount', () => {
      renderComponent(<JobLauncherV2 appId="flexserv" appVersion="1.4.0" />);
    });

    const toArgs = time('switch to Arguments', () => {
      fireEvent.click(screen.getAllByText('Arguments')[0]);
    });

    const inputs = screen.getAllByPlaceholderText('value');
    const target = inputs[0] as HTMLInputElement;
    const typing = time(`${KEYSTROKES} keystrokes in an app argument`, () => {
      for (let i = 0; i < KEYSTROKES; i += 1) {
        fireEvent.change(target, { target: { value: `--flag-0 v${i}` } });
      }
    });

    // eslint-disable-next-line no-console
    console.log(
      `per keystroke: ${(typing / KEYSTROKES).toFixed(
        1
      )}ms  |  mount ${mount.toFixed(0)}ms  |  section switch ${toArgs.toFixed(
        0
      )}ms`
    );
    expect(inputs.length).toBeGreaterThan(10);
    // A tripwire, not a target. Before the row inputs held their own value and
    // validation came off the keystroke path this was ~95ms per key in jsdom;
    // it is now well under 5. The bound is loose enough to survive a busy
    // machine and still catch a return to per-keystroke form-wide work.
    expect(typing / KEYSTROKES).toBeLessThan(25);
  });
});
