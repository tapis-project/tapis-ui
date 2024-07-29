import { Workflows } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../../utils';

type ListAllArchivesParams = {
  groupIds: Array<string>;
};

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

  const hasNullResults = resps.some((resp) => {
    return resp.result === null;
  });
  if (hasNullResults) {
    return {
      status: 'failure',
      message: 'Failed to list all Archives',
      metadata: last.metadata,
      result: [],
      version: last.version,
    };
  }

  let respAll: Workflows.RespArchiveList = {
    status: last.status,
    message: last.message,
    metadata: last.metadata,
    result: archives,
    version: last.version,
  };

  return respAll;
};

export default listAll;
