import { Workflows } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../../utils';

const create = (
  params: Workflows.AddPipelineArchiveRequest,
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
    api.addPipelineArchive(params)
  );
};

export default create;
