import { Workflows } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../../utils';

const details = (
  params: Workflows.GetPipelineRunRequest,
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
  return errorDecoder<Workflows.RespPipelineRun>(() =>
    api.getPipelineRun(params)
  );
};

export default details;
