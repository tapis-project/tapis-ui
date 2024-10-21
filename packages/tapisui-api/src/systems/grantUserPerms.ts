import { Systems } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../utils';

const grantUserPerms = (
  params: Systems.GrantUserPermsRequest,
  basePath: string,
  jwt: string
) => {
  const api: Systems.PermissionsApi = apiGenerator<Systems.PermissionsApi>(
    Systems,
    Systems.PermissionsApi,
    basePath,
    jwt
  );
  return errorDecoder<Systems.RespBasic>(() => api.grantUserPerms(params));
};

export default grantUserPerms;
