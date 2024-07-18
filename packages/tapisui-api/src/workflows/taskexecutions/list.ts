import { Workflows } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../../utils';

const list = (
  params: Workflows.ListTaskExecutionsRequest,
  basePath: string,
  jwt: string
) => {
  const api: Workflows.TaskExecutionsApi =
    apiGenerator<Workflows.TaskExecutionsApi>(
      Workflows,
      Workflows.TaskExecutionsApi,
      basePath,
      jwt
    );
  return errorDecoder<Workflows.RespTaskExecutionList>(() =>
    api.listTaskExecutions(params)
  );
};

export default list;
