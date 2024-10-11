import { Pods } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../utils';

const listVolumeFiles = (
  params: Pods.ListVolumeFilesRequest,
  basePath: string,
  jwt: string
): Promise<Pods.FilesListResponse> => {
  const api: Pods.VolumesApi = apiGenerator<Pods.VolumesApi>(
    Pods,
    Pods.VolumesApi,
    basePath,
    jwt
  );
  return errorDecoder<Pods.FilesListResponse>(() =>
    api.listVolumeFiles(params)
  );
};

export default listVolumeFiles;
