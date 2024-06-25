import { Workflows } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../../utils';

const list = (
  params: Workflows.ListGroupUsersRequest,
  basePath: string,
  jwt: string
) => {
  const api: Workflows.UsersApi = apiGenerator<Workflows.UsersApi>(
    Workflows,
    Workflows.UsersApi,
    basePath,
    jwt
  );
  return errorDecoder<Workflows.RespGroupList>(() =>
    api.listGroupUsers(params)
  );
};

export default list;
