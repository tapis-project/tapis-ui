import { Authenticator } from '@tapis/tapis-typescript';
import { errorDecoder, apiGenerator } from '../utils';

const createClient = (
  reqCreateClient: Authenticator.CreateClientRequest,
  basePath: string,
  jwt: string
) => {
  const api: Authenticator.ClientsApi = apiGenerator<Authenticator.ClientsApi>(
    Authenticator,
    Authenticator.ClientsApi,
    basePath,
    jwt
  );
  return errorDecoder<Authenticator.RespCreateClient>(() =>
    api.createClient(reqCreateClient)
  );
};

export default createClient;
