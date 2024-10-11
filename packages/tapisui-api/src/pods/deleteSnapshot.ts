import { Pods } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../utils';

const deleteSnapshot = (
  params: Pods.DeleteSnapshotRequest,
  basePath: string,
  jwt: string
): Promise<Pods.DeleteSnapshotResponse> => {
  const api: Pods.SnapshotsApi = apiGenerator<Pods.SnapshotsApi>(
    Pods,
    Pods.SnapshotsApi,
    basePath,
    jwt
  );
  return errorDecoder<Pods.DeleteSnapshotResponse>(() =>
    api.deleteSnapshot(params)
  );
};

export default deleteSnapshot;
