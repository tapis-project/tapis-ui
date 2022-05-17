import { Apps, Jobs, Systems } from '@tapis/tapis-typescript';

export const computeDefaultSystem = (app: Apps.TapisApp) => {
  return app.jobAttributes?.execSystemId;
};

type DefaultQueue = {
  source?: 'app' | 'system';
  queue?: string;
};

export const computeDefaultQueue = (
  job: Partial<Jobs.ReqSubmitJob>,
  app: Apps.TapisApp,
  systems: Array<Systems.TapisSystem>
): DefaultQueue => {
  if (app.jobAttributes?.execSystemLogicalQueue) {
    return {
      source: 'app',
      queue: app.jobAttributes?.execSystemLogicalQueue,
    };
  }
  const selectedSystem = job.execSystemId ?? app.jobAttributes?.execSystemId;
  const defaultSystem = systems.find((system) => system.id === selectedSystem);
  if (defaultSystem && defaultSystem.batchDefaultLogicalQueue) {
    return {
      source: 'system',
      queue: defaultSystem.batchDefaultLogicalQueue,
    };
  }
  return {
    source: undefined,
    queue: undefined,
  };
};

export const execSystemComplete = (
  job: Partial<Jobs.ReqSubmitJob>,
  app: Apps.TapisApp,
  systems: Array<Systems.TapisSystem>
) => {
  const defaultSystem = computeDefaultSystem(app);

  // Check that an exec system can be computed
  if (!job.execSystemId && !defaultSystem) {
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
