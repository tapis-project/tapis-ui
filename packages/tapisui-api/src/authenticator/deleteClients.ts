import { Authenticator } from '@tapis/tapis-typescript';
import { errorDecoder, apiGenerator } from '../utils';

const deleteClients = (
  params: Authenticator.DeleteClientRequest,
  basePath: string,
  jwt: string
) => {
  const api: Authenticator.ClientsApi = apiGenerator<Authenticator.ClientsApi>(
    Authenticator,
    Authenticator.ClientsApi,
    basePath,
    jwt
  );

  return errorDecoder<Authenticator.RespDeleteClient>(() =>
    api.deleteClient(params)
  );
};

export default deleteClients;
