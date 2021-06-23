import { Jobs } from '@tapis/tapis-typescript'
import { JobsReducerState } from 'tapis-redux/jobs/types';

export const jobInfo: Jobs.JobListDTO = {
  "uuid": "ed92f727-108f-4b5d-9cb7-e3ed4827788f-007",
  "name": "SleepSeconds",
  "owner": "testuser2",
  "appId": "SleepSeconds",
  "created": 1624465572,
  "status": Jobs.JobListDTOStatusEnum.Finished,
  "remoteStarted": 1624465572,
  "ended": 1624465572,
  "tenant": "dev",
  "execSystemId": "tapisv3-exec2",
  "archiveSystemId": "tapisv3-exec2",
  "appVersion": "0.0.1",
  "lastUpdated": 1624465572
}

export const jobsStore: JobsReducerState = {
  jobs: {
    error: null,
    loading: false,
    limit: 100,
    offset: 0,
    results: [ { ...jobInfo } ]
  },
  submit: {
    loading: false,
    error: null,
    result: null
  }
}