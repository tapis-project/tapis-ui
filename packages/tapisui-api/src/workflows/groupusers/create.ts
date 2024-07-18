import { Workflows } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../../utils';

const create = (
  params: Workflows.AddGroupUserRequest,
  basePath: string,
  jwt: string
) => {
  const api: Workflows.UsersApi = apiGenerator<Workflows.UsersApi>(
    Workflows,
    Workflows.UsersApi,
    basePath,
    jwt
  );
  return errorDecoder<Workflows.RespResourceURL>(() =>
    api.addGroupUser(params)
  );
};

export default create;
