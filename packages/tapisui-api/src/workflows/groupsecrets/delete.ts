import { Workflows } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../../utils';

const remove = (
  params: Workflows.RemoveGroupSecretRequest,
  basePath: string,
  jwt: string
) => {
  const api: Workflows.GroupSecretsApi =
    apiGenerator<Workflows.GroupSecretsApi>(
      Workflows,
      Workflows.GroupSecretsApi,
      basePath,
      jwt
    );
  return errorDecoder<Workflows.RespBase>(() => api.removeGroupSecret(params));
};

export default remove;
