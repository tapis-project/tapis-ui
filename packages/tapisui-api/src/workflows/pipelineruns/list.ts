import { Workflows } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../../utils';

const list = (
  params: Workflows.ListPipelineRunsRequest,
  basePath: string,
  jwt: string
) => {
  const api: Workflows.PipelineRunsApi =
    apiGenerator<Workflows.PipelineRunsApi>(
      Workflows,
      Workflows.PipelineRunsApi,
      basePath,
      jwt
    );
  return errorDecoder<Workflows.RespPipelineRunList>(() =>
    api.listPipelineRuns(params)
  );
};

export default list;
