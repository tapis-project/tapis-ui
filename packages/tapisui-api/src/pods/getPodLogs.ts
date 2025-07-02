import { Pods } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../utils';

const getPodLogs = (
  params: Pods.GetPodLogsRequest,
  basePath: string,
  jwt: string
): Promise<Pods.PodLogsResponse> => {
  const api: Pods.PodsApi = apiGenerator<Pods.PodsApi>(
    Pods,
    Pods.PodsApi,
    basePath,
    jwt
  );
  return errorDecoder<Pods.PodLogsResponse>(() => api.getPodLogs(params));
};

export default getPodLogs;
