import { Workflows } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../../utils';

const list = (basePath: string, jwt: string) => {
  const api: Workflows.SecretsApi = apiGenerator<Workflows.SecretsApi>(
    Workflows,
    Workflows.SecretsApi,
    basePath,
    jwt
  );
  return errorDecoder<Workflows.RespSecretList>(() => api.listSecrets());
};

export default list;
