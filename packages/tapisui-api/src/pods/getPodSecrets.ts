import { Pods } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../utils';

const getPodSecrets = (
  params: Pods.GetPodCredentialsRequest,
  basePath: string,
  jwt: string
): Promise<Pods.PodCredentialsResponse> => {
  const api: Pods.PodsApi = apiGenerator<Pods.PodsApi>(
    Pods,
    Pods.PodsApi,
    basePath,
    jwt
  );
  return errorDecoder<Pods.PodCredentialsResponse>(() =>
    api.getPodCredentials(params)
  );
};

export default getPodSecrets;
