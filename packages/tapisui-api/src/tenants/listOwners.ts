import { Tenants } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../utils';

const listOwners = (
  params: Tenants.ListOwnersRequest,
  basePath: string,
  jwt: string
) => {
  const api: Tenants.TenantsApi = apiGenerator<Tenants.TenantsApi>(
    Tenants,
    Tenants.TenantsApi,
    basePath,
    jwt
  );
  return errorDecoder<Tenants.RespListOwners>(() => api.listOwners(params));
};

export default listOwners;
