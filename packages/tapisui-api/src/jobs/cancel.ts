import { Jobs } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../utils';

export const cancel = (
  jobCancelReq: Jobs.CancelJobRequest,
  basePath: string,
  jwt: string
) => {
  const api: Jobs.JobsApi = apiGenerator<Jobs.JobsApi>(
    Jobs,
    Jobs.JobsApi,
    basePath,
    jwt
  );
  return errorDecoder<Jobs.RespCancelJob>(() => api.cancelJob(jobCancelReq));
};

export default cancel;
