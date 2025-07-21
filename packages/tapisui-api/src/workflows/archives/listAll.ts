import { Workflows } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../../utils';

const listAll = (basePath: string, jwt: string) => {
  const api: Workflows.ArchivesApi = apiGenerator<Workflows.ArchivesApi>(
    Workflows,
    Workflows.ArchivesApi,
    basePath,
    jwt
  );
  return errorDecoder<Workflows.RespArchiveList>(() => api.listAllArchives());
};

export default listAll;
