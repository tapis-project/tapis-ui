import { Workflows } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../../utils';

const list = (
  params: Workflows.ListArchivesRequest,
  basePath: string,
  jwt: string
) => {
  const api: Workflows.ArchivesApi = apiGenerator<Workflows.ArchivesApi>(
    Workflows,
    Workflows.ArchivesApi,
    basePath,
    jwt
  );
  return errorDecoder<Workflows.RespArchiveList>(() =>
    api.listArchives(params)
  );
};

export default list;
