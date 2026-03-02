import { Systems } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../utils';

const hostEval = (
  params: Systems.HostEvalRequest,
  basePath: string,
  jwt: string
) => {
  const api: Systems.SystemsApi = apiGenerator<Systems.SystemsApi>(
    Systems,
    Systems.SystemsApi,
    basePath,
    jwt
  );
  return errorDecoder<Systems.RespName>(() => api.hostEval(params));
};

export default hostEval;
