import { Apps } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../utils';

const unShareApp = (
  params: Apps.UnShareAppRequest,
  basePath: string,
  jwt: string
) => {
  const api: Apps.SharingApi = apiGenerator<Apps.SharingApi>(
    Apps,
    Apps.SharingApi,
    basePath,
    jwt
  );
  return errorDecoder<Apps.RespBasic>(() => api.unShareApp(params));
};

export default unShareApp;
