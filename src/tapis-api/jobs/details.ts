import { Jobs } from '@tapis/tapis-typescript';
import { apiGenerator } from 'tapis-api/utils';
import { errorDecoder } from 'tapis-api/utils';

const details = (params: Jobs.GetJobRequest, basePath: string, jwt: string) => {
  const api: Jobs.JobsApi = apiGenerator<Jobs.JobsApi>(Jobs, Jobs.JobsApi, basePath, jwt);
  return errorDecoder<Jobs.RespGetJob>(
    () => api.getJob(params)
  );
}

export default details;