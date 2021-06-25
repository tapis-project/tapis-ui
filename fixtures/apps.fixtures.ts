import { Apps } from '@tapis/tapis-typescript';
import { AppsReducerState } from 'tapis-redux/apps/types';

export const tapisApp: Apps.TapisApp = { 
  tenant: undefined,
  id: 'SleepSeconds',
  version: '0.0.1',
  description: undefined,
  appType: Apps.AppTypeEnum.Fork,
  owner: 'testuser2',
  enabled: undefined,
  runtime: undefined,
  runtimeVersion: undefined,
  runtimeOptions: undefined,
  containerImage: undefined,
  maxJobs: undefined,
  maxJobsPerUser: undefined,
  strictFileInputs: undefined,
  jobAttributes: undefined,
  tags: undefined,
  notes: undefined,
  deleted: undefined,
  created: undefined,
  updated: undefined
}

export const appsResponse: Apps.RespApps = {
  status: 'success',
  message: 'TAPIS_FOUND Apps found: 1 applications',
  version: '0.0.1-SNAPSHOT',
  result: [ { ...tapisApp } ],
  metadata: {
    recordCount: 1,
    recordLimit: 100,
    recordsSkipped: 0,
    orderBy: undefined,
    startAfter: undefined,
<<<<<<< HEAD
    totalCount: -1
=======
    totalCount: 1
>>>>>>> task/TUI-51--redux-applications-api
  }
}

export const appsStore: AppsReducerState = {
  apps: {
    error: null,
    loading: false,
<<<<<<< HEAD
    limit: -1,
=======
    limit: 100,
>>>>>>> task/TUI-51--redux-applications-api
    offset: 0,
    results: [ { ...tapisApp } ]
  }
}