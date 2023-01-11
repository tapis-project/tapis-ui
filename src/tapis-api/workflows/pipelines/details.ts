import { Workflows } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from 'tapis-api/utils';

const details = (
  params: Workflows.GetPipelineRequest,
  basePath: string,
  jwt: string
) => {
  const api: Workflows.PipelinesApi = apiGenerator<Workflows.PipelinesApi>(
    Workflows,
    Workflows.PipelinesApi,
    basePath,
    jwt
  );
  return errorDecoder<Workflows.RespPipeline>(() => api.getPipeline(params));
};

export default details;
