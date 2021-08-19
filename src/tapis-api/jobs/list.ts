import { Jobs } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from 'tapis-api/utils';

const list = (params: Jobs.GetJobListRequest, basePath: string, jwt: string) => {
  const api: Jobs.JobsApi = apiGenerator<Jobs.JobsApi>(Jobs, Jobs.JobsApi, basePath, jwt);
  return errorDecoder<Jobs.RespGetJobList>(
    () => api.getJobList(params)
  );
}

export default list;