import { Workflows } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../../utils';

const list = (
  params: Workflows.ListTasksRequest,
  basePath: string,
  jwt: string
) => {
  const api: Workflows.TasksApi = apiGenerator<Workflows.TasksApi>(
    Workflows,
    Workflows.TasksApi,
    basePath,
    jwt
  );
  return errorDecoder<Workflows.RespTaskList>(() => api.listTasks(params));
};

export default list;
