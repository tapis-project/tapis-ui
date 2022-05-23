import { Apps, Jobs, Systems } from '@tapis/tapis-typescript';

type DefaultSystem = {
  source?: 'app';
  systemId?: string;
};

/**
 * Computes the default execution system ID that will be used
 *
 * @param app
 * @returns
 */
export const computeDefaultSystem = (app: Apps.TapisApp): DefaultSystem => {
  if (app.jobAttributes?.execSystemId) {
    return {
      source: 'app',
      systemId: app.jobAttributes?.execSystemId,
    };
  }
  return {
    source: undefined,
    systemId: undefined,
  };
};

type DefaultQueue = {
  source?: 'app' | 'system' | 'app system';
  queue?: string;
};

/**
 * Computes the logical queue that will be used, if the job does not
 * specify one
 *
 * @param job
 * @param app
 * @param systems
 * @returns
 */
export const computeDefaultQueue = (
  job: Partial<Jobs.ReqSubmitJob>,
  app: Apps.TapisApp,
  systems: Array<Systems.TapisSystem>
): DefaultQueue => {
  // If the app specifies the logical queue, use that
  if (app.jobAttributes?.execSystemLogicalQueue) {
    return {
      source: 'app',
      queue: app.jobAttributes?.execSystemLogicalQueue,
    };
  }

  // If the job specifies a system, look for its default logical queue
  if (job.execSystemId) {
    const selectedSystem = systems.find(
      (system) => system.id === job.execSystemId
    );
    if (selectedSystem?.batchDefaultLogicalQueue) {
      return {
        source: 'system',
        queue: selectedSystem.batchDefaultLogicalQueue,
      };
    }
  }

  // If the app specifies a system, look for its default logical queue
  if (app.jobAttributes?.execSystemId) {
    const appSystem = systems.find(
      (system) => system.id === app.jobAttributes?.execSystemId
    );
    if (appSystem?.batchDefaultLogicalQueue) {
      return {
        source: 'app system',
        queue: appSystem.batchDefaultLogicalQueue,
      };
    }
  }

  // Return a result that has no computed default logical queue
  return {
    source: undefined,
    queue: undefined,
  };
};

type DefaultJobType = {
  source: 'app' | 'app system' | 'system' | 'tapis';
  jobType: Apps.JobTypeEnum;
};

/**
 * Determines the default jobType if one is not specified in the jobType field in a job
 * using the algorithm specified at:
 *
 * https://tapis.readthedocs.io/en/latest/technical/jobs.html#job-type
 *
 * @param job
 * @param app
 * @param systems
 * @returns
 */
export const computeDefaultJobType = (
  job: Partial<Jobs.ReqSubmitJob>,
  app: Apps.TapisApp,
  systems: Array<Systems.TapisSystem>
): DefaultJobType => {
  if (app.jobType) {
    return {
      source: 'app',
      jobType: app.jobType!,
    };
  }
  if (job?.execSystemId) {
    const selectedSystem = systems.find(
      (system) => system.id === job.execSystemId
    );
    if (selectedSystem?.canRunBatch) {
      return {
        source: 'system',
        jobType: Apps.JobTypeEnum.Batch,
      };
    }
  }
  if (app.jobAttributes?.execSystemId) {
    const appSystem = systems.find(
      (system) => system.id === app.jobAttributes?.execSystemId
    );
    if (appSystem?.canRunBatch) {
      return {
        source: 'app system',
        jobType: Apps.JobTypeEnum.Batch,
      };
    }
  }
  return {
    source: 'tapis',
    jobType: Apps.JobTypeEnum.Fork,
  };
};

export enum ValidateExecSystemResult {
  Complete = 'COMPLETE',
  ErrorNoExecSystem = 'ERROR_NO_EXEC_SYSTEM',
  ErrorExecSystemNotFound = 'ERROR_EXEC_SYSTEM_NOT_FOUND',
  ErrorExecSystemNoQueues = 'ERROR_EXEC_SYSTEM_NO_QUEUES',
  ErrorNoQueue = 'ERROR_NO_QUEUE',
  ErrorQueueNotFound = 'ERROR_QUEUE_NOT_FOUND',
}

export const validateExecSystem = (
  job: Partial<Jobs.ReqSubmitJob>,
  app: Apps.TapisApp,
  systems: Array<Systems.TapisSystem>
): ValidateExecSystemResult => {
  const defaultSystem = computeDefaultSystem(app);

  // Check that an exec system can be computed
  if (!job.execSystemId && !defaultSystem?.systemId) {
    return ValidateExecSystemResult.ErrorNoExecSystem;
  }

  const computedSystem = systems.find(
    (system) => system.id === (job.execSystemId ?? defaultSystem?.systemId)
  );
  if (!computedSystem) {
    return ValidateExecSystemResult.ErrorExecSystemNotFound;
  }

  // If the job will be a FORK job, skip queue validation
  const computedJobType = computeDefaultJobType(job, app, systems);
  if (
    job.jobType !== Apps.JobTypeEnum.Batch &&
    computedJobType.jobType === Apps.JobTypeEnum.Fork
  ) {
    return ValidateExecSystemResult.Complete;
  }

  // If the job will be a BATCH job, make sure that the selected execution system
  // has queues
  if (!computedSystem.batchLogicalQueues?.length) {
    return ValidateExecSystemResult.ErrorExecSystemNoQueues;
  }

  const defaultQueue = computeDefaultQueue(job, app, systems);

  // If the job type will be a BATCH job, ensure that a queue is specified
  // If no queue exists, there must be a fallback to the app or system default
  if (!job.execSystemLogicalQueue && !defaultQueue.queue) {
    return ValidateExecSystemResult.ErrorNoQueue;
  }

  // Check to see that the logical queue selected exists on the selected system
  const selectedSystem = systems.find(
    (system) => system.id === (job.execSystemId ?? defaultSystem?.systemId)
  );
  if (
    !selectedSystem?.batchLogicalQueues?.some(
      (queue) =>
        queue.name === (job.execSystemLogicalQueue ?? defaultQueue.queue)
    )
  ) {
    return ValidateExecSystemResult.ErrorQueueNotFound;
  }

  return ValidateExecSystemResult.Complete;
};
