import { Systems } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../utils';

const revokeUserPerms = (
  params: Systems.RevokeUserPermsRequest,
  basePath: string,
  jwt: string
) => {
  const api: Systems.PermissionsApi = apiGenerator<Systems.PermissionsApi>(
    Systems,
    Systems.PermissionsApi,
    basePath,
    jwt
  );
  return errorDecoder<Systems.RespBasic>(() => api.revokeUserPerms(params));
};

export default revokeUserPerms;
