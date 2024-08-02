import { Pods } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../utils';

const updatePod = (
  reqUpdatePod: Pods.UpdatePodRequest,
  basePath: string,
  jwt: string
): Promise<Pods.PodResponse> => {
  const api: Pods.PodsApi = apiGenerator<Pods.PodsApi>(
    Pods,
    Pods.PodsApi,
    basePath,
    jwt
  );
  return errorDecoder<Pods.PodResponse>(() => api.updatePod(reqUpdatePod));
};

export default updatePod;
