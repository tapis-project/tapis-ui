import { Systems } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../utils';

const changeOwner = (
  params: Systems.ChangeSystemOwnerRequest,
  systemId: string,
  username: string,
  jwt: string
) => {
  const api: Systems.PermissionsApi = apiGenerator<Systems.PermissionsApi>(
    Systems,
    Systems.PermissionsApi,
    username,
    jwt
  );
  return errorDecoder<Systems.RespNameArray>(() => api.getUserPerms(params));
};

export default changeOwner;
