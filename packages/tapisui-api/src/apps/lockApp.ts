import { Apps } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../utils';

const lockApp = (
  params: Apps.LockAppRequest,
  basePath: string,
  jwt: string
) => {
  const api: Apps.ApplicationsApi = apiGenerator<Apps.ApplicationsApi>(
    Apps,
    Apps.ApplicationsApi,
    basePath,
    jwt
  );
  return errorDecoder<Apps.RespChangeCount>(() => api.lockApp(params));
};

export default lockApp;
