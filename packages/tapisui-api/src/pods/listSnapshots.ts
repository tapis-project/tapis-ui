import { Pods } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../utils';

const listSnapshots = (
  basePath: string,
  jwt: string
): Promise<Pods.SnapshotsResponse> => {
  const api: Pods.SnapshotsApi = apiGenerator<Pods.SnapshotsApi>(
    Pods,
    Pods.SnapshotsApi,
    basePath,
    jwt
  );
  return errorDecoder<Pods.SnapshotsResponse>(() => api.listSnapshots());
};

export default listSnapshots;
