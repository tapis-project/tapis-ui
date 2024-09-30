import { Workflows } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../../utils';

const list = (
  basePath: string,
  jwt: string,
  params: Workflows.ListGroupSecretsRequest
) => {
  const api: Workflows.GroupSecretsApi =
    apiGenerator<Workflows.GroupSecretsApi>(
      Workflows,
      Workflows.GroupSecretsApi,
      basePath,
      jwt
    );
  return errorDecoder<Workflows.RespSecretList>(() =>
    api.listGroupSecrets(params)
  );
};

export default list;
