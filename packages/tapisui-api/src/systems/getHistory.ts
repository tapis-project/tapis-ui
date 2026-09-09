import { Systems } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../utils';

const getHistory = (
  params: Systems.GetHistoryRequest,
  basePath: string,
  jwt: string
) => {
  const api: Systems.SystemsApi = apiGenerator<Systems.SystemsApi>(
    Systems,
    Systems.SystemsApi,
    basePath,
    jwt
  );
  return errorDecoder<Systems.RespSystemHistory>(() => api.getHistory(params));
};

export default getHistory;
