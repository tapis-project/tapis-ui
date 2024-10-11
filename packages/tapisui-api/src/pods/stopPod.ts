import { Pods } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../utils';

const stopPod = (
  params: Pods.StopPodRequest,
  basePath: string,
  jwt: string
): Promise<Pods.PodResponse> => {
  const api: Pods.PodsApi = apiGenerator<Pods.PodsApi>(
    Pods,
    Pods.PodsApi,
    basePath,
    jwt
  );
  return errorDecoder<Pods.PodResponse>(() => api.stopPod(params));
};

export default stopPod;
