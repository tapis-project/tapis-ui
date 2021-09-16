import { Streams } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from 'tapis-api/utils';

const list = (
  params: Streams.ListVariablesRequest,
  basePath: string,
  jwt: string
) => {
  const api: Streams.VariablesApi = apiGenerator<Streams.VariablesApi>(
    Streams,
    Streams.VariablesApi,
    basePath,
    jwt
  );
  return errorDecoder<Streams.RespListVariables>(() => api.listVariables(params));
};

export default list;
