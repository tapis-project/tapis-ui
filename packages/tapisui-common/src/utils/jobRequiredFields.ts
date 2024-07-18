import { Jobs } from '@tapis/tapis-typescript';

export const jobRequiredFieldsComplete = (job: Partial<Jobs.ReqSubmitJob>) => {
  return !!job.name && !!job.appId && !!job.appVersion;
};
