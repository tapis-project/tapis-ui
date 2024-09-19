import { Pods } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../utils';

const setSnapshotPermission = (
  params: Pods.SetSnapshotPermissionRequest,
  basePath: string,
  jwt: string
): Promise<Pods.SnapshotPermissionsResponse> => {
  const api: Pods.PermissionsApi = apiGenerator<Pods.PermissionsApi>(
    Pods,
    Pods.PermissionsApi,
    basePath,
    jwt
  );
  return errorDecoder<Pods.SnapshotPermissionsResponse>(() =>
    api.setSnapshotPermission(params)
  );
};

export default setSnapshotPermission;
