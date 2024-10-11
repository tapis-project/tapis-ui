import { Pods } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../utils';

const deleteSnapshotPermission = (
  params: Pods.DeleteSnapshotPermissionRequest,
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
    api.deleteSnapshotPermission(params)
  );
};

export default deleteSnapshotPermission;
