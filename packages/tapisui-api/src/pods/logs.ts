import { Pods } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../utils';

const logs = (
  params: Pods.GetPodLogsRequest,
  basePath: string,
  jwt: string
) => {
  const api: Pods.LogsApi = apiGenerator<Pods.LogsApi>(
    Pods,
    Pods.LogsApi,
    basePath,
    jwt
  );
  return errorDecoder<Pods.PodLogsResponse>(() => api.getPodLogs(params));
};

export default logs;
