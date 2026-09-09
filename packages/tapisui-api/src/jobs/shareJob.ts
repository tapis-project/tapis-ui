import { Jobs } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../utils';

const shareJob = (
  params: Jobs.ShareJobRequest,
  basePath: string,
  jwt: string
) => {
  const api: Jobs.SharingApi = apiGenerator<Jobs.SharingApi>(
    Jobs,
    Jobs.SharingApi,
    basePath,
    jwt
  );
  return errorDecoder<Jobs.RespShareJob>(() => api.shareJob(params));
};

export default shareJob;
