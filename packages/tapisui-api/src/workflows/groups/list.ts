import { Workflows } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../../utils';

const list = (basePath: string, jwt: string) => {
  const api: Workflows.GroupsApi = apiGenerator<Workflows.GroupsApi>(
    Workflows,
    Workflows.GroupsApi,
    basePath,
    jwt
  );
  return errorDecoder<Workflows.RespGroupList>(() => api.listGroups());
};

export default list;
