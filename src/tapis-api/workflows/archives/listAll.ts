import { Workflows } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from 'tapis-api/utils';
import { ListAllArchivesParams } from 'tapis-hooks/workflows/archives/useListAll';

const listAll = async (
  params: ListAllArchivesParams,
  basePath: string,
  jwt: string
) => {
  const api: Workflows.ArchivesApi = apiGenerator<Workflows.ArchivesApi>(
    Workflows,
    Workflows.ArchivesApi,
    basePath,
    jwt
  );

  const resps = await Promise.all(
    params.groupIds.map((groupId) => {
      try {
        return errorDecoder<Workflows.RespArchiveList>(() =>
          api.listArchives({ groupId })
        );
      } catch (e) {
        throw e;
      }
    })
  );

  let archives: Array<Workflows.Archive> = [];

  // Add every archive from each response to the list
  resps.map((resp) => resp.result.map((archive) => archives.push(archive)));

  const last = resps[resps.length - 1];

  let respAll: Workflows.RespArchiveList = {
    status: last ? last.status : 'success',
    message: last ? last.message : 'success',
    metadata: last ? last.metadata : {},
    result: archives,
    version: last ? last.version : 'latest', // ?
  };

  return respAll;
};

export default listAll;
