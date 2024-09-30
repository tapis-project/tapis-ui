import { Pods } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../utils';

const getVolume = (
  params: Pods.GetVolumeRequest,
  basePath: string,
  jwt: string
): Promise<Pods.VolumeResponse> => {
  const api: Pods.VolumesApi = apiGenerator<Pods.VolumesApi>(
    Pods,
    Pods.VolumesApi,
    basePath,
    jwt
  );
  return errorDecoder<Pods.VolumeResponse>(() => api.getVolume(params));
};

export default getVolume;
