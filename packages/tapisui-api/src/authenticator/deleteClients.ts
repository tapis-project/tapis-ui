import { Authenticator } from '@tapis/tapis-typescript';
import { errorDecoder, apiGenerator } from '../utils';

const deleteClients = (params: string, basePath: string, jwt: string) => {
  const api: Authenticator.ClientsApi = apiGenerator<Authenticator.ClientsApi>(
    Authenticator,
    Authenticator.ClientsApi,
    basePath,
    jwt
  );

  const requestParameters: Authenticator.DeleteClientRequest = {
    clientId: params,
  };
  return errorDecoder<Authenticator.RespDeleteClient>(() =>
    api.deleteClient(requestParameters)
  );
};

export default deleteClients;
