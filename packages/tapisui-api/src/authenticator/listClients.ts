import { Authenticator } from '@tapis/tapis-typescript';
import { errorDecoder, apiGenerator } from '../utils';

const listClients = (
  params: Authenticator.ListClientsRequest,
  basePath: string,
  jwt: string
) => {
  const api: Authenticator.ClientsApi = apiGenerator<Authenticator.ClientsApi>(
    Authenticator,
    Authenticator.ClientsApi,
    basePath,
    jwt
  );

  const requestParameters: Authenticator.ListClientsRequest = {
    limit: 1000,
    offset: 1000,
  };
  return errorDecoder<Authenticator.RespListClients>(() =>
    api.listClients(params)
  );
};

export default listClients;
