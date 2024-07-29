import { Workflows } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../../utils';

const details = (
  params: Workflows.GetArchiveRequest,
  basePath: string,
  jwt: string
) => {
  const api: Workflows.ArchivesApi = apiGenerator<Workflows.ArchivesApi>(
    Workflows,
    Workflows.ArchivesApi,
    basePath,
    jwt
  );
  return errorDecoder<Workflows.RespArchive>(() => api.getArchive(params));
};

export default details;
