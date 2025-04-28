import { Authenticator } from '@tapis/tapis-typescript';
import { errorDecoder, apiGenerator } from '../utils';

const deleteClients = (clientId: string, basePath: string, jwt: string) => {
  const api: Authenticator.ClientsApi = apiGenerator<Authenticator.ClientsApi>(
    Authenticator,
    Authenticator.ClientsApi,
    basePath,
    jwt
  );

  return errorDecoder<Authenticator.RespDeleteClient>(() =>
    api.deleteClient({ clientId })
  );
};

export default deleteClients;
