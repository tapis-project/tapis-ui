import { Workflows } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../../utils';

const create = (
  params: Workflows.CreateIdentityRequest,
  basePath: string,
  jwt: string
) => {
  const api: Workflows.IdentitiesApi = apiGenerator<Workflows.IdentitiesApi>(
    Workflows,
    Workflows.IdentitiesApi,
    basePath,
    jwt
  );
  return errorDecoder<Workflows.RespResourceURL>(() =>
    api.createIdentity(params)
  );
};

export default create;
