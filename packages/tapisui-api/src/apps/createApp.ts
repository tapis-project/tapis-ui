import { Apps } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../utils';

const createApp = (
  createAppVersionRequest: Apps.CreateAppVersionRequest,
  basepath: string,
  jwt: string
) => {
  const api: Apps.ApplicationsApi = apiGenerator<Apps.ApplicationsApi>(
    Apps,
    Apps.ApplicationsApi,
    basepath,
    jwt
  );
  return errorDecoder<Apps.RespBasic>(() =>
    api.createAppVersion(createAppVersionRequest)
  );
};

export default createApp;
