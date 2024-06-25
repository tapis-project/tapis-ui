import { Workflows } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../../utils';

const details = (
  params: Workflows.GetIdentityRequest,
  basePath: string,
  jwt: string
) => {
  const api: Workflows.IdentitiesApi = apiGenerator<Workflows.IdentitiesApi>(
    Workflows,
    Workflows.IdentitiesApi,
    basePath,
    jwt
  );
  return errorDecoder<Workflows.RespIdentity>(() => api.getIdentity(params));
};

export default details;
