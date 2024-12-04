import { Jobs } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../utils';

const resubmit = (
  params: Jobs.ResubmitJobRequest,
  basePath: string,
  jwt: string
): Promise<Jobs.RespSubmitJob> => {
  const api: Jobs.JobsApi = apiGenerator<Jobs.JobsApi>(
    Jobs,
    Jobs.JobsApi,
    basePath,
    jwt
  );
  return errorDecoder<Jobs.RespSubmitJob>(() => api.resubmitJob(params));
};

export default resubmit;
