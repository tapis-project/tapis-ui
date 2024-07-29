import { Pods } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../utils';

const detailsSnapshots = (
  params: Pods.GetSnapshotRequest,
  basePath: string,
  jwt: string
) => {
  const api: Pods.SnapshotsApi = apiGenerator<Pods.SnapshotsApi>(
    Pods,
    Pods.SnapshotsApi,
    basePath,
    jwt
  );
  return errorDecoder<Pods.SnapshotResponse>(() => api.getSnapshot(params));
};

export default detailsSnapshots;
