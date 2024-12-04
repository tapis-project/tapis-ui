import { Workflows } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../../utils';

const remove = (
  params: Workflows.DeleteSecretRequest,
  basePath: string,
  jwt: string
) => {
  const api: Workflows.SecretsApi = apiGenerator<Workflows.SecretsApi>(
    Workflows,
    Workflows.SecretsApi,
    basePath,
    jwt
  );
  return errorDecoder<Workflows.RespString>(() => api.deleteSecret(params));
};

export default remove;
