import { Pods } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../utils';

const getSnapshotPermissions = (
  params: Pods.GetSnapshotPermissionsRequest,
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
    api.getSnapshotPermissions(params)
  );
};

export default getSnapshotPermissions;
