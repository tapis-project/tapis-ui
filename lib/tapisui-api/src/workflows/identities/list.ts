import { Workflows } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../../utils';

const list = (basePath: string, jwt: string) => {
  const api: Workflows.IdentitiesApi = apiGenerator<Workflows.IdentitiesApi>(
    Workflows,
    Workflows.IdentitiesApi,
    basePath,
    jwt
  );
  return errorDecoder<Workflows.RespGroupList>(() => api.listIdentities());
};

export default list;
