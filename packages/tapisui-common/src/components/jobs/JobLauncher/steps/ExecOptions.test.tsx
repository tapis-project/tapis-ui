import '@testing-library/jest-dom/extend-expect';
import renderComponent from '../../../../testing/utils';
import { tapisApp } from '../../../../fixtures/apps.fixtures';
import { tapisSystem } from '../../../../fixtures/systems.fixtures';
import useJobLauncher from '../../../../components/jobs/JobLauncher/components/useJobLauncher';
import ExecOptionsStep from './ExecOptions';
import { JobLauncherWizardRender } from '../JobLauncherWizard';
import { act } from '@testing-library/react';
import { Systems } from '@tapis/tapis-typescript';

jest.mock('components/jobs/JobLauncher/components/useJobLauncher');

describe('ExecOptions step', () => {
  it('Shows default systems', async () => {
    (useJobLauncher as jest.Mock).mockReturnValue({
      job: {},
      app: tapisApp,
      systems: [tapisSystem],
    });
    const { getAllByTestId } = renderComponent(
      <JobLauncherWizardRender jobSteps={[ExecOptionsStep]} />
    );
    await act(async () => {});
    const execSystemId = getAllByTestId('execSystemId')[0];
    expect(execSystemId).toHaveValue('');
  });
  it('Shows queue options if the job is a batch job', async () => {
    (useJobLauncher as jest.Mock).mockReturnValue({
      job: {},
      app: tapisApp,
      systems: [tapisSystem],
    });
    const { getAllByTestId } = renderComponent(
      <JobLauncherWizardRender jobSteps={[ExecOptionsStep]} />
    );
    await act(async () => {});
    const execSystemLogicalQueue = getAllByTestId('execSystemLogicalQueue')[0];
    expect(execSystemLogicalQueue).toBeDefined();
    expect(execSystemLogicalQueue).toHaveValue('');
  });
  it('Does not show systems that are not capable of batch jobs', async () => {
    const tapisSystemNoQueues = JSON.parse(
      JSON.stringify(tapisSystem)
    ) as Systems.TapisSystem;
    tapisSystemNoQueues.batchLogicalQueues = [];
    tapisSystemNoQueues.id = 'noqueues.execution';
    (useJobLauncher as jest.Mock).mockReturnValue({
      job: {},
      app: tapisApp,
      systems: [tapisSystem, tapisSystemNoQueues],
    });
    const { getAllByTestId } = renderComponent(
      <JobLauncherWizardRender jobSteps={[ExecOptionsStep]} />
    );
    await act(async () => {});
    const execSystems = getAllByTestId(/execSystemId-/);
    expect(execSystems.length).toEqual(1);
    expect(execSystems[0]).toHaveProperty('label', 'testuser2.execution');
  });
});
