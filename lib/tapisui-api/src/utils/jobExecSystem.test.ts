import { Apps, Systems } from '@tapis/tapis-typescript';
import { describe, it, expect } from 'vitest';
import { tapisApp } from 'fixtures/apps.fixtures';
import { tapisSystem } from 'fixtures/systems.fixtures';
import {
  computeDefaultQueue,
  computeDefaultSystem,
  validateExecSystem,
  ValidateExecSystemResult,
} from './jobExecSystem';

describe('Job Exec System utils', () => {
  it('determines default system', () => {
    expect(computeDefaultSystem(tapisApp)).toEqual({
      source: 'app',
      systemId: 'testuser2.execution',
    });
  });
  it('determines the default logical queue from an app', () => {
    expect(computeDefaultQueue({}, tapisApp, [tapisSystem])).toEqual({
      source: 'app',
      queue: 'tapisNormal',
    });
  });
  it('determines the default logical queue from the default system specified by the app', () => {
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
  it('detects a valid job request that satisfies exec system options', () => {
    expect(validateExecSystem({}, tapisApp, [tapisSystem])).toBe(
      ValidateExecSystemResult.Complete
    );
  });
  it('skips queue validation if a complete job request will be a FORK job', () => {
    expect(
      validateExecSystem({ jobType: Apps.JobTypeEnum.Fork }, tapisApp, [
        tapisSystem,
      ])
    ).toBe(ValidateExecSystemResult.Complete);
  });
  it('detects an invalid job request if the specified exec system is missing', () => {
    expect(validateExecSystem({}, tapisApp, [])).toBe(
      ValidateExecSystemResult.ErrorExecSystemNotFound
    );
  });
  it('detects an invalid job request if an exec system is not specified', () => {
    const tapisAppNoSystem = JSON.parse(
      JSON.stringify(tapisApp)
    ) as Apps.TapisApp;
    tapisAppNoSystem.jobAttributes!.execSystemId = undefined;
    expect(validateExecSystem({}, tapisAppNoSystem, [])).toBe(
      ValidateExecSystemResult.ErrorNoExecSystem
    );
  });
  it('detects an invalid job request if a queue cannot be found', () => {
    const tapisAppNoQueue = JSON.parse(
      JSON.stringify(tapisApp)
    ) as Apps.TapisApp;
    tapisAppNoQueue.jobAttributes!.execSystemLogicalQueue = undefined;
    const tapisSystemNoDefaultQueue = JSON.parse(
      JSON.stringify(tapisSystem)
    ) as Systems.TapisSystem;
    tapisSystemNoDefaultQueue.batchDefaultLogicalQueue = undefined;
    expect(
      validateExecSystem({}, tapisAppNoQueue, [tapisSystemNoDefaultQueue])
    ).toBe(ValidateExecSystemResult.ErrorNoQueue);
  });
  it('detects an invalid job request if the job is a batch job but the selected system has no queues', () => {
    const tapisSystemNoQueue = JSON.parse(
      JSON.stringify(tapisSystem)
    ) as Systems.TapisSystem;
    tapisSystemNoQueue.batchLogicalQueues = [];
    expect(
      validateExecSystem({ jobType: Apps.JobTypeEnum.Batch }, tapisApp, [
        tapisSystemNoQueue,
      ])
    ).toBe(ValidateExecSystemResult.ErrorExecSystemNoQueues);
  });
  it('detects an invalid job request if the job specifies a queue that the exec system does not have', () => {
    expect(
      validateExecSystem({ execSystemLogicalQueue: 'badQueue' }, tapisApp, [
        tapisSystem,
      ])
    ).toBe(ValidateExecSystemResult.ErrorQueueNotFound);
  });
});
