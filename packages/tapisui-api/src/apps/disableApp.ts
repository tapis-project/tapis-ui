import { Apps } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../utils';

const disableApp = (
  params: Apps.DisableAppRequest,
  basePath: string,
  jwt: string
) => {
  const api: Apps.ApplicationsApi = apiGenerator<Apps.ApplicationsApi>(
    Apps,
    Apps.ApplicationsApi,
    basePath,
    jwt
  );
  return errorDecoder<Apps.RespChangeCount>(() => api.disableApp(params));
};

export default disableApp;
