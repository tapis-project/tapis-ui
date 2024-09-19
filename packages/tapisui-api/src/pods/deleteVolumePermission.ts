import { Pods } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../utils';

const deleteVolumePermission = (
  params: Pods.DeleteVolumePermissionRequest,
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
    api.deleteVolumePermission(params)
  );
};

export default deleteVolumePermission;
