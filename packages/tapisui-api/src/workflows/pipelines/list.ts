import { Workflows } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../../utils';

const list = (
  params: Workflows.ListPipelinesRequest,
  basePath: string,
  jwt: string
) => {
  const api: Workflows.PipelinesApi = apiGenerator<Workflows.PipelinesApi>(
    Workflows,
    Workflows.PipelinesApi,
    basePath,
    jwt
  );
  return errorDecoder<Workflows.RespPipelineList>(() =>
    api.listPipelines(params)
  );
};

export default list;
