import { Workflows } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../../utils';

const remove = (
  params: Workflows.RemoveGroupUserRequest,
  basePath: string,
  jwt: string
) => {
  const api: Workflows.UsersApi = apiGenerator<Workflows.UsersApi>(
    Workflows,
    Workflows.UsersApi,
    basePath,
    jwt
  );
  return errorDecoder<Workflows.RespGroupUser>(() =>
    api.removeGroupUser(params)
  );
};

export default remove;
