import { Workflows } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../../utils';

const create = (
  params: Workflows.CreateSecretRequest,
  basePath: string,
  jwt: string
) => {
  const api: Workflows.SecretsApi = apiGenerator<Workflows.SecretsApi>(
    Workflows,
    Workflows.SecretsApi,
    basePath,
    jwt
  );
  return errorDecoder<Workflows.RespSecret>(() => api.createSecret(params));
};

export default create;
