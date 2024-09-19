import { Pods } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../utils';

const uploadToVolume = (
  params: Pods.UploadToVolumeRequest,
  basePath: string,
  jwt: string
): Promise<Pods.FilesUploadResponse> => {
  const api: Pods.VolumesApi = apiGenerator<Pods.VolumesApi>(
    Pods,
    Pods.VolumesApi,
    basePath,
    jwt
  );
  return errorDecoder<Pods.FilesUploadResponse>(() =>
    api.uploadToVolume(params)
  );
};

export default uploadToVolume;
