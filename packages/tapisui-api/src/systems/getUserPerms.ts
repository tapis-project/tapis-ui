import { Systems } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../utils';

const getUserPerms = (
  params: Systems.GetUserPermsRequest,
  basePath: string,
  jwt: string
) => {
  const api: Systems.PermissionsApi = apiGenerator<Systems.PermissionsApi>(
    Systems,
    Systems.PermissionsApi,
    basePath,
    jwt
  );
  return errorDecoder<Systems.RespNameArray>(() => api.getUserPerms(params));
};

export default getUserPerms;
