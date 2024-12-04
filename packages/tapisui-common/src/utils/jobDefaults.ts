import { Apps, Jobs, Systems } from '@tapis/tapis-typescript';
import { generateRequiredFileInputsFromApp } from '../utils/jobFileInputs';
import { generateRequiredFileInputArraysFromApp } from '../utils/jobFileInputArrays';
import { generateJobArgsFromSpec } from '../utils/jobArgs';

const generateJobDefaults = ({
  app,
  systems,
}: {
  app?: Apps.TapisApp;
  systems: Array<Systems.TapisSystem>;
}): Partial<Jobs.ReqSubmitJob> => {
  if (!app) {
    return {};
  }

  const defaultValues: Partial<Jobs.ReqSubmitJob> = {
    name: `${app.id}-${app.version}`,
    description: app.description,
    appId: app.id,
    appVersion: app.version,
    archiveOnAppError: app.jobAttributes?.archiveOnAppError ?? true,
    archiveSystemId: app.jobAttributes?.archiveSystemId,
    archiveSystemDir: app.jobAttributes?.archiveSystemDir,
    nodeCount: app.jobAttributes?.nodeCount,
    coresPerNode: app.jobAttributes?.coresPerNode,
    jobType: app.jobType,
    memoryMB: app.jobAttributes?.memoryMB,
    maxMinutes: app.jobAttributes?.maxMinutes,
    isMpi: app.jobAttributes?.isMpi,
    mpiCmd: app.jobAttributes?.mpiCmd,
    cmdPrefix: app.jobAttributes?.cmdPrefix,
    fileInputs: generateRequiredFileInputsFromApp(app),
    fileInputArrays: generateRequiredFileInputArraysFromApp(app),
    parameterSet: {
      appArgs: generateJobArgsFromSpec(
        app.jobAttributes?.parameterSet?.appArgs ?? []
      ),
      containerArgs: generateJobArgsFromSpec(
        app.jobAttributes?.parameterSet?.containerArgs ?? []
      ),
      schedulerOptions: generateJobArgsFromSpec(
        app.jobAttributes?.parameterSet?.schedulerOptions ?? []
      ),
      archiveFilter: app.jobAttributes?.parameterSet?.archiveFilter,
      envVariables: app.jobAttributes?.parameterSet?.envVariables,
    },
  };
  return defaultValues;
};

export default generateJobDefaults;
