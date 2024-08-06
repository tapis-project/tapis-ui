import { Jobs } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../utils';

const unhideJob = (jobUuid: string, basePath: string, jwt: string) => {
  const api: Jobs.JobsApi = apiGenerator<Jobs.JobsApi>(
    Jobs,
    Jobs.JobsApi,
    basePath,
    jwt
  );
  return errorDecoder<Jobs.RespHideJob>(() => api.unhideJob({ jobUuid }));
};

export default unhideJob;
