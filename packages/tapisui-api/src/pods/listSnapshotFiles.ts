import { Pods } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../utils';

const listSnapshotFiles = (
  params: Pods.ListSnapshotFilesRequest,
  basePath: string,
  jwt: string
): Promise<Pods.FilesListResponse> => {
  const api: Pods.SnapshotsApi = apiGenerator<Pods.SnapshotsApi>(
    Pods,
    Pods.SnapshotsApi,
    basePath,
    jwt
  );
  return errorDecoder<Pods.FilesListResponse>(() =>
    api.listSnapshotFiles(params)
  );
};

export default listSnapshotFiles;
