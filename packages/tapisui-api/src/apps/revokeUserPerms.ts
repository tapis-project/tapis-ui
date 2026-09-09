import { Apps } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../utils';

const revokeUserPerms = (
  params: Apps.RevokeUserPermsRequest,
  basePath: string,
  jwt: string
) => {
  const api: Apps.PermissionsApi = apiGenerator<Apps.PermissionsApi>(
    Apps,
    Apps.PermissionsApi,
    basePath,
    jwt
  );
  return errorDecoder<Apps.RespBasic>(() => api.revokeUserPerms(params));
};

export default revokeUserPerms;
