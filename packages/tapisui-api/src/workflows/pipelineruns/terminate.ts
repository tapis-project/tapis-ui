import { Workflows } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../../utils';

const terminate = (
  params: Workflows.TerminatePipelineRequest,
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
    api.terminatePipeline(params)
  );
};

export default terminate;
