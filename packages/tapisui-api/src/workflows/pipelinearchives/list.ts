import { Workflows } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../../utils';

const list = (
  params: Workflows.ListPipelineArchivesRequest,
  basePath: string,
  jwt: string
) => {
  const api: Workflows.PipelineArchivesApi =
    apiGenerator<Workflows.PipelineArchivesApi>(
      Workflows,
      Workflows.PipelineArchivesApi,
      basePath,
      jwt
    );
  return errorDecoder<Workflows.RespArchiveList>(() =>
    api.listPipelineArchives(params)
  );
};

export default list;
