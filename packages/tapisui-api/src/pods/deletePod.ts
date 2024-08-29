import { Pods } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../utils';

const deletePod = (
  params: Pods.DeletePodRequest,
  basePath: string,
  jwt: string
): Promise<Pods.PodDeleteResponse> => {
  const api: Pods.PodsApi = apiGenerator<Pods.PodsApi>(
    Pods,
    Pods.PodsApi,
    basePath,
    jwt
  );
  return errorDecoder<Pods.PodDeleteResponse>(() => api.deletePod(params));
};

export default deletePod;
