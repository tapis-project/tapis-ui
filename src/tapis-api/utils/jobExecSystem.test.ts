import { Apps, Systems } from '@tapis/tapis-typescript';
import '@testing-library/jest-dom/extend-expect';
import { tapisApp } from 'fixtures/apps.fixtures';
import { tapisSystem } from 'fixtures/systems.fixtures';
import {
  computeDefaultQueue,
  computeDefaultSystem,
  execSystemComplete,
} from './jobExecSystem';

describe('Job Exec System utils', () => {
  it('determines default system', () => {
    expect(computeDefaultSystem(tapisApp)).toEqual({ source: "app", systemId: "testuser2.execution"});
  });
  it('determines the default logical queue from an app', () => {
    expect(computeDefaultQueue({}, tapisApp, [tapisSystem])).toEqual({
      source: 'app',
      queue: 'tapisNormal',
    });
  });
  it('determines the default logical queue from a system default', () => {
    const tapisAppNoQueue = JSON.parse(
      JSON.stringify(tapisApp)
    ) as Apps.TapisApp;
    tapisAppNoQueue.jobAttributes!.execSystemLogicalQueue = undefined;
    expect(computeDefaultQueue({}, tapisAppNoQueue, [tapisSystem])).toEqual({
      source: 'app system',
      queue: 'tapisNormal',
    });
  });
  it('determines the default logical queue from a system default, where the system is selected by the job', () => {
    const tapisAppNoQueue = JSON.parse(
      JSON.stringify(tapisApp)
    ) as Apps.TapisApp;
    tapisAppNoQueue.jobAttributes!.execSystemLogicalQueue = undefined;
    expect(
      computeDefaultQueue(
        { execSystemId: 'testuser2.execution' },
        tapisAppNoQueue,
        [tapisSystem]
      )
    ).toEqual({
      source: 'system',
      queue: 'tapisNormal',
    });
  });
  it('determines that there is no computed queue if a system does not exist', () => {
    const tapisAppNoQueue = JSON.parse(
      JSON.stringify(tapisApp)
    ) as Apps.TapisApp;
    tapisAppNoQueue.jobAttributes!.execSystemLogicalQueue = undefined;
    expect(computeDefaultQueue({}, tapisAppNoQueue, [])).toEqual({
      source: undefined,
      queue: undefined,
    });
  });
  it('detects a complete job request that satisfies exec system options', () => {
    expect(execSystemComplete({}, tapisApp, [tapisSystem])).toBe(true);
  });
  it('detects a complete job request if a job is a Fork job', () => {
    expect(
      execSystemComplete({ jobType: Apps.JobTypeEnum.Fork }, tapisApp, [
        tapisSystem,
      ])
    ).toBe(true);
  });
  it('detects an incomplete job request if an exec system is not specified', () => {
    const tapisAppNoSystem = JSON.parse(
      JSON.stringify(tapisApp)
    ) as Apps.TapisApp;
    tapisAppNoSystem.jobAttributes!.execSystemId = undefined;
    expect(execSystemComplete({}, tapisAppNoSystem, [])).toBe(false);
  });
  it('detects an incomplete job request if a queue cannot be found', () => {
    const tapisAppNoQueue = JSON.parse(
      JSON.stringify(tapisApp)
    ) as Apps.TapisApp;
    tapisAppNoQueue.jobAttributes!.execSystemLogicalQueue = undefined;
    const tapisSystemNoDefaultQueue = JSON.parse(
      JSON.stringify(tapisSystem)
    ) as Systems.TapisSystem;
    tapisSystemNoDefaultQueue.batchDefaultLogicalQueue = undefined;
    expect(
      execSystemComplete({}, tapisAppNoQueue, [tapisSystemNoDefaultQueue])
    ).toBe(false);
  });
});
