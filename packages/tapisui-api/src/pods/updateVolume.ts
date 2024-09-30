import { Pods } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../utils';

const updateVolume = (
  params: Pods.UpdateVolumeRequest,
  basePath: string,
  jwt: string
): Promise<Pods.VolumeResponse> => {
  const api: Pods.VolumesApi = apiGenerator<Pods.VolumesApi>(
    Pods,
    Pods.VolumesApi,
    basePath,
    jwt
  );
  return errorDecoder<Pods.VolumeResponse>(() => api.updateVolume(params));
};

export default updateVolume;
