import { Workflows } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../../utils';

const remove = (
  params: Workflows.DeleteTaskRequest,
  basePath: string,
  jwt: string
) => {
  const api: Workflows.TasksApi = apiGenerator<Workflows.TasksApi>(
    Workflows,
    Workflows.TasksApi,
    basePath,
    jwt
  );
  return errorDecoder<Workflows.RespString>(() => api.deleteTask(params));
};

export default remove;
