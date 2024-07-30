import { Workflows } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../../utils';

const patch = (
  params: Workflows.PatchTaskRequest,
  basePath: string,
  jwt: string
) => {
  const api: Workflows.TasksApi = apiGenerator<Workflows.TasksApi>(
    Workflows,
    Workflows.TasksApi,
    basePath,
    jwt
  );
  return errorDecoder<Workflows.RespTask>(() => api.patchTask(params));
};

export default patch;
