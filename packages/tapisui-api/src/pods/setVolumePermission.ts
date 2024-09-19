import { Pods } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../utils';

const setVolumePermission = (
  params: Pods.SetVolumePermissionRequest,
  basePath: string,
  jwt: string
): Promise<Pods.VolumePermissionsResponse> => {
  const api: Pods.PermissionsApi = apiGenerator<Pods.PermissionsApi>(
    Pods,
    Pods.PermissionsApi,
    basePath,
    jwt
  );
  return errorDecoder<Pods.VolumePermissionsResponse>(() =>
    api.setVolumePermission(params)
  );
};

export default setVolumePermission;
