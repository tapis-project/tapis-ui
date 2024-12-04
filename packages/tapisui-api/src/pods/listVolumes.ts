import { Pods } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../utils';

const listVolumes = (
  basePath: string,
  jwt: string
): Promise<Pods.VolumesResponse> => {
  const api: Pods.VolumesApi = apiGenerator<Pods.VolumesApi>(
    Pods,
    Pods.VolumesApi,
    basePath,
    jwt
  );
  return errorDecoder<Pods.VolumesResponse>(() => api.listVolumes());
};

export default listVolumes;
