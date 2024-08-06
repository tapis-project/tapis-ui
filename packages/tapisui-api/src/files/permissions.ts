import { Files } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../utils';

const permissions = (
  params: Files.GetPermissionsRequest,
  basePath: string,
  jwt: string
) => {
  const api: Files.PermissionsApi = apiGenerator<Files.PermissionsApi>(
    Files,
    Files.PermissionsApi,
    basePath,
    jwt
  );
  return errorDecoder<Files.FilePermissionResponse>(() =>
    api.getPermissions(params)
  );
};

export default permissions;
