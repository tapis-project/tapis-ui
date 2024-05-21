import { Jobs } from '@tapis/tapis-typescript';

export const jobInfo: Jobs.JobListDTO = {
  uuid: 'ed92f727-108f-4b5d-9cb7-e3ed4827788f-007',
  name: 'SleepSeconds',
  owner: 'testuser2',
  appId: 'SleepSeconds',
  created: 1624465572,
  status: Jobs.JobListDTOStatusEnum.Finished,
  remoteStarted: 1624465572,
  ended: 1624465572,
  tenant: 'dev',
  execSystemId: 'tapisv3-exec2',
  archiveSystemId: 'tapisv3-exec2',
  appVersion: '0.0.1',
  lastUpdated: 1624465572,
};

export const validJobSubmission = {
  name: 'bsf-no-file-inputs-specified',
  appId: 'bsf',
  appVersion: '1',
  description: 'somedesc',
};

export const validJobSubmissionAlt = {
  name: 'bsf-conforming-file-inputs',
  appId: 'bsf',
  appVersion: '1',
  jobAttributes: {
    fileInputs: [
      {
        sourceUrl: 'tapis://testuser2.execution/data.txt',
        targetPath: 'data.txt',
        inPlace: false,
        meta: {
          name: 'Data file',
          required: true,
        },
      },
    ],
  },
};

// Job submission will fail because fileInputs[0].meta.name does not conform to the
// app-level definition for this file input. Will pass
// if fileInputs[0].meta.name == 'Data file'
export const invalidJobSubmission = {
  name: 'bsf-different-meta-name',
  appId: 'bsf',
  appVersion: '1',
  jobAttributes: {
    fileInputs: [
      {
        sourceUrl: 'tapis://testuser2.execution/data.txt',
        targetPath: 'data.txt',
        inPlace: false,
        meta: {
          name: 'newmetaname',
          required: true,
        },
      },
    ],
  },
};
