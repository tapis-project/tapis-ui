import * as Apps from '@tapis/tapis-typescript-apps';

export const tapisApp: Apps.TapisApp = {
  id: 'SleepSeconds',
  version: '0.0.1',
  jobAttributes: {
    dynamicExecSystem: false,
    execSystemId: 'testuser2.execution',
    execSystemExecDir: 'scratch',
    execSystemInputDir: 'scratch/data',
    execSystemOutputDir: 'scratch/output',
    archiveSystemId: 'testuser2.execution',
    /* eslint-disable-next-line */
    archiveSystemDir: 'jobs/archive/${JobUUID}',
    archiveOnAppError: false,
    parameterSet: {
      appArgs: [],
      containerArgs: [],
      schedulerOptions: [],
      envVariables: [],
      archiveFilter: {
        includes: [],
        excludes: [],
        includeLaunchFiles: true,
      },
    },
    fileInputs: [
      {
        name: 'requiredInput',
        description: 'Required file input',
        inputMode: Apps.FileInputModeEnum.Required,
        autoMountLocal: true,
        targetPath: 'required.txt',
      },
      {
        name: 'optionalInput',
        description: 'Optional file input',
        inputMode: Apps.FileInputModeEnum.Optional,
        autoMountLocal: true,
        targetPath: 'optional.txt',
      },
      {
        name: 'fixedInput',
        description: 'Fixed file input',
        inputMode: Apps.FileInputModeEnum.Fixed,
        autoMountLocal: true,
        sourceUrl: 'tapis://system/fixed-input.txt',
        targetPath: 'fixed.txt',
      },
    ],
    nodeCount: 1,
    coresPerNode: 1,
    memoryMB: 100,
    maxMinutes: 10,
    subscriptions: [],
    tags: [],
  },
};

export const appsResponse: Apps.RespApps = {
  status: 'success',
  message: 'TAPIS_FOUND Apps found: 1 applications',
  version: '0.0.1-SNAPSHOT',
  result: [{ ...tapisApp }],
  metadata: {
    recordCount: 1,
    recordLimit: 100,
    recordsSkipped: 0,
    orderBy: undefined,
    startAfter: undefined,
    totalCount: 1,
  },
};
