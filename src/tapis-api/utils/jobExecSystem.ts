import { Apps, Jobs, Systems } from '@tapis/tapis-typescript';

type DefaultSystem = {
  source?: 'app'
  systemId?: string
}

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
      systemId: app.jobAttributes?.execSystemId
    }
  }
  return {
    source: undefined,
    systemId: undefined
  }
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
    const selectedSystem = systems.find((system) => system.id === job.execSystemId);
    if (selectedSystem?.batchDefaultLogicalQueue) {
      return {
        source: 'system',
        queue: selectedSystem.batchDefaultLogicalQueue
      } 
    }
  }

  // If the app specifies a system, look for its default logical queue
  if (app.jobAttributes?.execSystemId) {
    const appSystem = systems.find((system) => system.id === app.jobAttributes?.execSystemId);
    if (appSystem?.batchDefaultLogicalQueue) {
      return {
        source: 'app system',
        queue: appSystem.batchDefaultLogicalQueue
      }
    }
  }

  // Return a result that has no computed default logical queue
  return {
    source: undefined,
    queue: undefined,
  };
};

type DefaultJobType = {
  source: 'app' | 'app system' | 'system' | 'tapis',
  jobType: Apps.JobTypeEnum
}

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
  systems: Array<Systems.TapisSystem>,
): DefaultJobType => {
  if (app.jobType) {
    return {
      source: 'app',
      jobType: app.jobType!
    }
  }
  if (job?.execSystemId) {
    const selectedSystem = systems.find(system => system.id === job.execSystemId);
    if (selectedSystem?.canRunBatch) {
      return {
        source: 'system',
        jobType: Apps.JobTypeEnum.Batch
      }
    }
  }
  if (app.jobAttributes?.execSystemId) {
    const appSystem = systems.find(system => system.id === app.jobAttributes?.execSystemId);
    if (appSystem?.canRunBatch) {
      return {
        source: 'app system',
        jobType: Apps.JobTypeEnum.Batch
      }
    }
  }
  return {
    source: 'tapis',
    jobType: Apps.JobTypeEnum.Fork
  }
}

export const execSystemComplete = (
  job: Partial<Jobs.ReqSubmitJob>,
  app: Apps.TapisApp,
  systems: Array<Systems.TapisSystem>
) => {
  const defaultSystem = computeDefaultSystem(app);

  // Check that an exec system can be computed
  if (!job.execSystemId && !defaultSystem?.systemId) {
    return false;
  }

  // Check that a job type has been specified
  if (!job.jobType && !app.jobType) {
    return false;
  }
  // If the job type will be a batch job, ensure that a queue is specified
  if (
    (!!job.jobType && job.jobType === Apps.JobTypeEnum.Batch) ||
    (!job.jobType && app.jobType === Apps.JobTypeEnum.Batch)
  ) {
    // Check to see if the job has a specified queue
    if (!job.execSystemLogicalQueue) {
      // If no queue exists, there must be a fallback to the app or system default
      const defaultQueue = computeDefaultQueue(job, app, systems);
      if (!defaultQueue.source) {
        return false;
      }
    }
  }
  return true;
};
