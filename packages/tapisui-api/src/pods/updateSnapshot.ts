import { Pods } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../utils';

const updateSnapshot = (
  params: Pods.UpdateSnapshotRequest,
  basePath: string,
  jwt: string
): Promise<Pods.SnapshotResponse> => {
  const api: Pods.SnapshotsApi = apiGenerator<Pods.SnapshotsApi>(
    Pods,
    Pods.SnapshotsApi,
    basePath,
    jwt
  );
  return errorDecoder<Pods.SnapshotResponse>(() => api.updateSnapshot(params));
};

export default updateSnapshot;
