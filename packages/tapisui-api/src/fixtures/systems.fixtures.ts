import { Systems } from '@tapis/tapis-typescript';

export const dockerRuntime: Systems.JobRuntime = {
  runtimeType: Systems.RuntimeTypeEnum.Docker,
  version: '0.0.1',
};

export const singularityRuntime: Systems.JobRuntime = {
  runtimeType: Systems.RuntimeTypeEnum.Singularity,
  version: '0.0.1',
};

export const jobRuntimes: Array<Systems.JobRuntime> = [
  { ...dockerRuntime },
  { ...singularityRuntime },
];

export const tapisSystem: Systems.TapisSystem = {
  tenant: 'tacc',
  id: 'testuser2.execution',
  description: 'Tapis v3 execution system - patched',
  systemType: Systems.SystemTypeEnum.Linux,
  owner: 'nathandf',
  host: '129.114.17.113',
  enabled: true,
  effectiveUserId: 'testuser2',
  defaultAuthnMethod: Systems.AuthnEnum.PkiKeys,
  authnCredential: undefined,
  bucketName: undefined,
  rootDir: '/home/testuser2/prod/',
  port: -1,
  useProxy: false,
  proxyHost: undefined,
  proxyPort: -1,
  dtnSystemId: undefined,
  canExec: true,
  canRunBatch: true,
  jobRuntimes: jobRuntimes,
  jobWorkingDir: 'work',
  jobEnvVariables: [],
  jobMaxJobs: 2147483647,
  jobMaxJobsPerUser: 2147483647,
  batchScheduler: Systems.SchedulerTypeEnum.Slurm,
  batchLogicalQueues: [
    {
      name: 'tapisNormal',
      hpcQueueName: 'debug',
      maxJobs: 50,
      maxJobsPerUser: 10,
      minNodeCount: 1,
      maxNodeCount: 16,
      minCoresPerNode: 1,
      maxCoresPerNode: 68,
      minMemoryMB: 1,
      maxMemoryMB: 16384,
      minMinutes: 1,
      maxMinutes: 60,
    },
  ],
  batchDefaultLogicalQueue: 'tapisNormal',
  batchSchedulerProfile: undefined,
  jobCapabilities: [],
  tags: [],
  notes: {},
  uuid: 'f398646d-b4f5-4c8a-89be-182def19de1e',
  deleted: false,
  created: '2021-11-29T19:09:37.535745Z',
  updated: '2021-12-06T17:18:05.625441Z',
};
