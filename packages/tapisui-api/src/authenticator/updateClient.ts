import { Authenticator } from '@tapis/tapis-typescript';
import { errorDecoder, apiGenerator } from '../utils';

const updateClient = (
  clientId: string,
  basePath: string,
  jwt: string,
  callback_url: string,
  display_name: string
) => {
  const api: Authenticator.ClientsApi = apiGenerator<Authenticator.ClientsApi>(
    Authenticator,
    Authenticator.ClientsApi,
    basePath,
    jwt
  );

  const requestParameters: Authenticator.UpdateClientRequest = {
    clientId,
    updateClient: { callback_url, display_name },
  };

  return errorDecoder<Authenticator.RespUpdateClient>(() =>
    api.updateClient(requestParameters)
  );
};

export default updateClient;
