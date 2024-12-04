import { Workflows } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../../utils';

const create = (
  params: Workflows.AddGroupSecretRequest,
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
  return errorDecoder<Workflows.RespGroupSecret>(() =>
    api.addGroupSecret(params)
  );
};

export default create;
