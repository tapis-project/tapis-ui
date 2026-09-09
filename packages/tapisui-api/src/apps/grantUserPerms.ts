import { Apps } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../utils';

const grantUserPerms = (
  params: Apps.GrantUserPermsRequest,
  basePath: string,
  jwt: string
) => {
  const api: Apps.PermissionsApi = apiGenerator<Apps.PermissionsApi>(
    Apps,
    Apps.PermissionsApi,
    basePath,
    jwt
  );
  return errorDecoder<Apps.RespBasic>(() => api.grantUserPerms(params));
};

export default grantUserPerms;
