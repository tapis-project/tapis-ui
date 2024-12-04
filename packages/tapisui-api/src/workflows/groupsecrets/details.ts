import { Workflows } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../../utils';

const details = (
  basePath: string,
  jwt: string,
  params: Workflows.GetGroupSecretRequest
) => {
  const api: Workflows.GroupSecretsApi =
    apiGenerator<Workflows.GroupSecretsApi>(
      Workflows,
      Workflows.GroupSecretsApi,
      basePath,
      jwt
    );
  return errorDecoder<Workflows.RespGroupSecret>(() =>
    api.getGroupSecret(params)
  );
};

export default details;
