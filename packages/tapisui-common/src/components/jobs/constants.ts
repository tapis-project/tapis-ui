import { Jobs } from '@tapis/tapis-typescript';

export const jobRecoverableStatuses = [
  Jobs.JobStatusEnum.Blocked,
  Jobs.JobListDTOStatusEnum.Blocked,
  Jobs.JobStatusEnum.Paused,
  Jobs.JobListDTOStatusEnum.Paused,
];

export const jobRunningStatuses = [
  Jobs.JobStatusEnum.Running,
  Jobs.JobListDTOStatusEnum.Running,
];

export const jobTerminalStatuses = [
  Jobs.JobStatusEnum.Cancelled,
  Jobs.JobListDTOStatusEnum.Cancelled,
  Jobs.JobStatusEnum.Failed,
  Jobs.JobListDTOStatusEnum.Failed,
  Jobs.JobStatusEnum.Finished,
  Jobs.JobListDTOStatusEnum.Finished,
];
