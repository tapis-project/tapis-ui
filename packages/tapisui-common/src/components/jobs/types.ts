import { Jobs } from '@tapis/tapis-typescript';

export type JobRecoverableStatus =
  | Jobs.JobStatusEnum.Blocked
  | Jobs.JobListDTOStatusEnum.Blocked
  | Jobs.JobStatusEnum.Paused
  | Jobs.JobListDTOStatusEnum.Paused;

export type JobTerminalStatus =
  | Jobs.JobStatusEnum.Cancelled
  | Jobs.JobListDTOStatusEnum.Cancelled
  | Jobs.JobStatusEnum.Failed
  | Jobs.JobListDTOStatusEnum.Failed
  | Jobs.JobStatusEnum.Finished
  | Jobs.JobListDTOStatusEnum.Finished;
