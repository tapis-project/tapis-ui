import { Workflows } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from 'tapis-api/utils';

const run = (
  params: Workflows.RunPipelineRequest,
  basePath: string,
  jwt: string
) => {
  const api: Workflows.EventsApi = apiGenerator<Workflows.EventsApi>(
    Workflows,
    Workflows.EventsApi,
    basePath,
    jwt
  );
  return errorDecoder<Workflows.RespEvent>(() => api.runPipeline(params));
};

export default run;
