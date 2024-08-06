import { Workflows } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../../utils';

const run = (
  params: Workflows.RunPipelineRequest,
  basePath: string,
  jwt: string
) => {
  const api: Workflows.PipelinesApi = apiGenerator<Workflows.PipelinesApi>(
    Workflows,
    Workflows.PipelinesApi,
    basePath,
    jwt
  );
  return errorDecoder<Workflows.RespPipelineRun>(() => api.runPipeline(params));
};

export default run;
