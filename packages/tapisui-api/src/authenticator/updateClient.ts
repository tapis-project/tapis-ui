import { Authenticator } from '@tapis/tapis-typescript';
import { errorDecoder, apiGenerator } from '../utils';

const updateClient = (
  params: Authenticator.UpdateClientRequest,
  basePath: string,
  jwt: string
) => {
  const api: Authenticator.ClientsApi = apiGenerator<Authenticator.ClientsApi>(
    Authenticator,
    Authenticator.ClientsApi,
    basePath,
    jwt
  );

  return errorDecoder<Authenticator.RespUpdateClient>(() =>
    api.updateClient(params)
  );
};

export default updateClient;
