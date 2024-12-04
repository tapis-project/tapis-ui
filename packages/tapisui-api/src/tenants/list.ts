import { Tenants } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../utils';

const list = (
  params: Tenants.ListTenantsRequest,
  basePath: string,
  jwt: string
) => {
  const api: Tenants.TenantsApi = apiGenerator<Tenants.TenantsApi>(
    Tenants,
    Tenants.TenantsApi,
    basePath,
    jwt
  );
  return errorDecoder<Tenants.RespListTenants>(() => api.listTenants(params));
};

export default list;
