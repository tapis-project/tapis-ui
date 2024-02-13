import { Pods } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from 'tapis-api/utils';

const list = (
  params: Pods.GetSystemsRequest,
  basePath: string,
  jwt: string
) => {
  const api: Pods.SystemsApi = apiGenerator<Pods.SystemsApi>(
    Pods,
    Pods.SystemsApi,
    basePath,
    jwt
  );
  return errorDecoder<Pods.RespSystems>(() => api.getSystems(params));
};

export default list;
