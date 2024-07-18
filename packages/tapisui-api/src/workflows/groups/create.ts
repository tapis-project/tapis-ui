import { Workflows } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../../utils';

const create = (
  params: Workflows.CreateGroupRequest,
  basePath: string,
  jwt: string
) => {
  const api: Workflows.GroupsApi = apiGenerator<Workflows.GroupsApi>(
    Workflows,
    Workflows.GroupsApi,
    basePath,
    jwt
  );
  return errorDecoder<Workflows.RespResourceURL>(() => api.createGroup(params));
};

export default create;
