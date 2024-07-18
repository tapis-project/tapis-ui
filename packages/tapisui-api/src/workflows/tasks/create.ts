import { Workflows } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../../utils';

const create = (
  params: Workflows.CreateTaskRequest,
  basePath: string,
  jwt: string
) => {
  const api: Workflows.TasksApi = apiGenerator<Workflows.TasksApi>(
    Workflows,
    Workflows.TasksApi,
    basePath,
    jwt
  );
  return errorDecoder<Workflows.RespResourceURL>(() => api.createTask(params));
};

export default create;
