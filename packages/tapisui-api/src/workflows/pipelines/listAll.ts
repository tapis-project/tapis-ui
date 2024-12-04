import { Workflows } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../../utils';

type ListAllPipelinesParams = {
  groupIds: Array<string>;
};

const listAll = async (
  params: ListAllPipelinesParams,
  basePath: string,
  jwt: string
) => {
  const api: Workflows.PipelinesApi = apiGenerator<Workflows.PipelinesApi>(
    Workflows,
    Workflows.PipelinesApi,
    basePath,
    jwt
  );

  const resps = await Promise.all(
    params.groupIds.map((groupId) => {
      try {
        return errorDecoder<Workflows.RespPipelineList>(() =>
          api.listPipelines({ groupId })
        );
      } catch (e) {
        throw e;
      }
    })
  );

  let pipelines: Array<Workflows.Pipeline> = [];

  // Add every pipeline from each response to the list
  resps.map((resp) => resp.result.map((pipeline) => pipelines.push(pipeline)));

  const last = resps[resps.length - 1];

  const hasNullResults = resps.some((resp) => {
    return resp.result === null;
  });
  if (hasNullResults) {
    return {
      status: 'failure',
      message: 'Failed to list all Pipelines',
      metadata: last.metadata,
      result: [],
      version: last.version,
    };
  }

  let respAll: Workflows.RespPipelineList = {
    status: last.status,
    message: last.message,
    metadata: last.metadata,
    result: pipelines,
    version: last.version,
  };

  return respAll;
};

export default listAll;
