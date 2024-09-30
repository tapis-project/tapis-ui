import { Workflows } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../../utils';

const details = (
  basePath: string,
  jwt: string,
  params: Workflows.GetSecretRequest
) => {
  const api: Workflows.SecretsApi = apiGenerator<Workflows.SecretsApi>(
    Workflows,
    Workflows.SecretsApi,
    basePath,
    jwt
  );
  return errorDecoder<Workflows.RespSecret>(() => api.getSecret(params));
};

export default details;
