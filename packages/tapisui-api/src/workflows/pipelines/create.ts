import { Workflows } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../../utils';

const create = (
  params: Workflows.CreatePipelineRequest,
  basePath: string,
  jwt: string
) => {
  const api: Workflows.PipelinesApi = apiGenerator<Workflows.PipelinesApi>(
    Workflows,
    Workflows.PipelinesApi,
    basePath,
    jwt
  );
  return errorDecoder<Workflows.RespResourceURL>(() =>
    api.createPipeline(params)
  );
};

export default create;
