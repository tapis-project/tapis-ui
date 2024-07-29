import { Systems } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../utils';

const list = (
  params: Systems.GetSystemsRequest,
  basePath: string,
  jwt: string
) => {
  const api: Systems.SystemsApi = apiGenerator<Systems.SystemsApi>(
    Systems,
    Systems.SystemsApi,
    basePath,
    jwt
  );
  return errorDecoder<Systems.RespSystems>(() => api.getSystems(params));
};

export default list;
