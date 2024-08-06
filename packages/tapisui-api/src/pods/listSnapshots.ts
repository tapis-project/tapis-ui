import { Pods } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../utils';

const listSnapshots = (params: {}, basePath: string, jwt: string) => {
  const api: Pods.SnapshotsApi = apiGenerator<Pods.SnapshotsApi>(
    Pods,
    Pods.SnapshotsApi,
    basePath,
    jwt
  );
  return errorDecoder<Pods.SnapshotsResponse>(() => api.getSnapshots());
};

export default listSnapshots;
