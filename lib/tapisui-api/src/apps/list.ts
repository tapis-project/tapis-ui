import { Apps } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../utils';

const list = (params: Apps.GetAppsRequest, basePath: string, jwt: string) => {
  const api: Apps.ApplicationsApi = apiGenerator<Apps.ApplicationsApi>(
    Apps,
    Apps.ApplicationsApi,
    basePath,
    jwt
  );
  return errorDecoder<Apps.RespApps>(() => api.getApps(params));
};

export default list;
