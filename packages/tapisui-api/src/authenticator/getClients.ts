import { Authenticator } from '@tapis/tapis-typescript';
import { errorDecoder, apiGenerator } from '../utils';

const getClients = (params: string, basePath: string, jwt: string) => {
  const api: Authenticator.ClientsApi = apiGenerator<Authenticator.ClientsApi>(
    Authenticator,
    Authenticator.ClientsApi,
    basePath,
    jwt
  );

  const requestParameters: Authenticator.GetClientRequest = {
    clientId: params,
  };
  return errorDecoder<Authenticator.RespGetClient>(() =>
    api.getClient(requestParameters)
  );
};

export default getClients;
