var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import { Systems } from '@tapis/tapis-typescript';
export var dockerRuntime = {
    runtimeType: Systems.RuntimeTypeEnum.Docker,
    version: '0.0.1',
};
export var singularityRuntime = {
    runtimeType: Systems.RuntimeTypeEnum.Singularity,
    version: '0.0.1',
};
export var jobRuntimes = [
    __assign({}, dockerRuntime),
    __assign({}, singularityRuntime),
];
export var tapisSystem = {
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
    dtnMountPoint: undefined,
    dtnMountSourcePath: undefined,
    isDtn: false,
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
    importRefId: undefined,
    uuid: 'f398646d-b4f5-4c8a-89be-182def19de1e',
    deleted: false,
    created: '2021-11-29T19:09:37.535745Z',
    updated: '2021-12-06T17:18:05.625441Z',
};
