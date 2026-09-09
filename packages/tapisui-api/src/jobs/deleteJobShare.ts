import { Jobs } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../utils';

/**
 * Takes back EVERY resource this user was given on the job — the service
 * has no per-resource revoke, so the panel must say so before pressing.
 */
const deleteJobShare = (
  params: Jobs.DeleteJobShareRequest,
  basePath: string,
  jwt: string
) => {
  const api: Jobs.SharingApi = apiGenerator<Jobs.SharingApi>(
    Jobs,
    Jobs.SharingApi,
    basePath,
    jwt
  );
  return errorDecoder<Jobs.RespUnShareJob>(() => api.deleteJobShare(params));
};

export default deleteJobShare;
