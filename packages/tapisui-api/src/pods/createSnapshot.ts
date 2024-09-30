import { Pods } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../utils';

const createSnapshot = (
  params: Pods.CreateSnapshotRequest,
  basePath: string,
  jwt: string
): Promise<Pods.SnapshotResponse> => {
  const api: Pods.SnapshotsApi = apiGenerator<Pods.SnapshotsApi>(
    Pods,
    Pods.SnapshotsApi,
    basePath,
    jwt
  );
  return errorDecoder<Pods.SnapshotResponse>(() => api.createSnapshot(params));
};

export default createSnapshot;
