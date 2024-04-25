import { Pods } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from 'tapis-api/utils';

const stopPod = (podId: string, basePath: string, jwt: string) => {
  const api: Pods.PodsApi = apiGenerator<Pods.PodsApi>(
    Pods,
    Pods.PodsApi,
    basePath,
    jwt
  );
  return errorDecoder<Pods.PodResponse>(() => api.stopPod({ podId }));
};

export default stopPod;
