/* eslint-disable no-template-curly-in-string */
import { Apps } from '@tapis/tapis-typescript';

export const tapisApp: Apps.TapisApp = {
  tenant: 'tacc',
  id: 'FullJobAttrs',
  version: '0.0.1',
  description: 'Sample app for testing singularity in batch mode',
  owner: 'cicsvc',
  enabled: true,
  runtime: Apps.RuntimeEnum.Singularity,
  runtimeOptions: [Apps.RuntimeOptionEnum.SingularityRun],
  containerImage: 'library://richcar/default/sleep-seconds-sy:1.0',
  jobType: Apps.JobTypeEnum.Batch,
  maxJobs: 2147483647,
  maxJobsPerUser: 2147483647,
  strictFileInputs: false,
  jobAttributes: {
    description: 'Transfer files and sleep for a specified amount of time',
    dynamicExecSystem: false,
    execSystemId: 'testuser2.execution',
    execSystemLogicalQueue: 'tapisNormal',
    archiveOnAppError: true,
    isMpi: false,
    parameterSet: {
      appArgs: [
        {
          arg: 'someval',
          name: 'aa.required',
          description: 'required app arg',
          inputMode: Apps.ArgInputModeEnum.Required,
        },
        {
          arg: 'someval',
          name: 'aa.fixed',
          description: 'fixed app arg',
          inputMode: Apps.ArgInputModeEnum.Fixed,
        },
        {
          arg: 'someval',
          name: 'aa.iod',
          description: 'include on demand app arg',
          inputMode: Apps.ArgInputModeEnum.IncludeOnDemand,
        },
        {
          arg: 'someval',
          name: 'aa.ibd',
          description: 'include by default app arg',
          inputMode: Apps.ArgInputModeEnum.IncludeByDefault,
        },
      ],
      containerArgs: [
        {
          arg: 'ls',
          name: 'ls.r',
          description: 'container arg required - ls',
          inputMode: Apps.ArgInputModeEnum.Required,
        },
        {
          arg: 'cd ./',
          name: 'cd.f',
          description: 'container arg fixed - cd',
          inputMode: Apps.ArgInputModeEnum.Fixed,
        },
        {
          arg: 'cd ./',
          name: 'cd.iod',
          description: 'container arg include on demand',
          inputMode: Apps.ArgInputModeEnum.IncludeOnDemand,
        },
        {
          arg: 'cd ./',
          name: 'cd.ibd',
          description: 'app arg include by default',
          inputMode: Apps.ArgInputModeEnum.IncludeByDefault,
        },
      ],
      schedulerOptions: [],
      envVariables: [
        {
          key: 'MAIN_CLASS',
          value: 'edu.utexas.tacc.testapps.tapis.SleepSecondsSy',
        },
        {
          key: 'JOBS_PARMS',
          value: '15',
        },
      ],
      archiveFilter: {
        includes: ['Sleep*', 'tapisjob.*'],
        excludes: [],
        includeLaunchFiles: true,
      },
    },
    fileInputs: [
      {
        name: 'required-complete',
        description: 'A required input that is completely specified',
        inputMode: Apps.FileInputModeEnum.Required,
        autoMountLocal: true,
        sourceUrl:
          'tapis://tapisv3-exec-slurm-taccprod-new/jobs/input/empty.txt',
        targetPath: 'empty.txt',
      },
      {
        name: 'required-incomplete',
        description: 'A required input that is missing a sourceUrl',
        inputMode: Apps.FileInputModeEnum.Required,
        autoMountLocal: true,
        targetPath: 'file1.txt',
      },
      {
        name: 'optional-complete',
        description: 'An optional input that is completely specified',
        inputMode: Apps.FileInputModeEnum.Optional,
        autoMountLocal: true,
        sourceUrl:
          'tapis://tapisv3-exec-slurm-taccprod-new/jobs/input/optional-file.txt',
        targetPath: 'file2.txt',
      },
      {
        name: 'optional-incomplete',
        description: 'An optional input that is missing a sourceUrl',
        inputMode: Apps.FileInputModeEnum.Optional,
        autoMountLocal: true,
        targetPath: 'file3.txt',
      },
      {
        name: 'fixed',
        description: 'A fixed input that is completely specified',
        inputMode: Apps.FileInputModeEnum.Fixed,
        autoMountLocal: true,
        sourceUrl:
          'tapis://tapisv3-exec-slurm-taccprod-new/jobs/input/fixed-file.txt',
        targetPath: 'file4.txt',
      },
    ],
    fileInputArrays: [
      {
        name: 'required-complete',
        description: 'A required input array that is completely specified',
        inputMode: Apps.FileInputModeEnum.Required,
        sourceUrls: [
          'tapis://tapisv3-exec-slurm-taccprod-new/jobs/input/empty.txt',
          'tapis://tapisv3-exec-slurm-taccprod-new/jobs/input/file1.txt',
        ],
        targetDir: '/jobs/input/arrays/required/',
      },
      {
        name: 'required-incomplete',
        description: 'A required input array that is missing sourceUrls',
        inputMode: Apps.FileInputModeEnum.Required,
        targetDir: '/jobs/input/arrays/required/',
      },
      {
        name: 'fixed',
        description: 'A fixed input array',
        inputMode: Apps.FileInputModeEnum.Fixed,
        sourceUrls: [
          'tapis://tapisv3-exec-slurm-taccprod-new/jobs/input/empty.txt',
          'tapis://tapisv3-exec-slurm-taccprod-new/jobs/input/file1.txt',
        ],
        targetDir: '/jobs/input/arrays/fixed/',
      },
      {
        name: 'optional-complete',
        description: 'An optional input array that is completely specified',
        inputMode: Apps.FileInputModeEnum.Optional,
        sourceUrls: [
          'tapis://tapisv3-exec-slurm-taccprod-new/jobs/input/file3.txt',
          'tapis://tapisv3-exec-slurm-taccprod-new/jobs/input/file4.txt',
        ],
        targetDir: '/jobs/input/arrays/optional/',
      },
      {
        name: 'optional-incomplete',
        description: 'An optional input array that is missing sourceUrls',
        inputMode: Apps.FileInputModeEnum.Optional,
        targetDir: '/jobs/input/arrays/optional/',
      },
    ],
    nodeCount: 1,
    coresPerNode: 1,
    memoryMB: 100,
    maxMinutes: 10,
    subscriptions: [],
    tags: ['test', 'sleep'],
  },
  tags: [],
  notes: {},
  uuid: 'd3412826-13fc-4709-b9d9-26ccbc0ecbd3',
  deleted: false,
  created: '2022-02-23T19:13:00.460695Z',
  updated: '2022-02-23T19:13:00.460695Z',
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
