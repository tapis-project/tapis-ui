import { Pods } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../utils';

const deleteVolume = (
  params: Pods.DeleteVolumeRequest,
  basePath: string,
  jwt: string
): Promise<Pods.DeleteVolumeResponse> => {
  const api: Pods.VolumesApi = apiGenerator<Pods.VolumesApi>(
    Pods,
    Pods.VolumesApi,
    basePath,
    jwt
  );
  return errorDecoder<Pods.DeleteVolumeResponse>(() =>
    api.deleteVolume(params)
  );
};

export default deleteVolume;
