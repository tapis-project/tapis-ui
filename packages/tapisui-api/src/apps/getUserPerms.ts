import { Apps } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../utils';

const getUserPerms = (
  params: Apps.GetUserPermsRequest,
  basePath: string,
  jwt: string
) => {
  const api: Apps.PermissionsApi = apiGenerator<Apps.PermissionsApi>(
    Apps,
    Apps.PermissionsApi,
    basePath,
    jwt
  );
  return errorDecoder<Apps.RespNameArray>(() => api.getUserPerms(params));
};

export default getUserPerms;
