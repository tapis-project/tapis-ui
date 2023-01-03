import { Workflows } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from 'tapis-api/utils';
import { ListAllPipelinesParams } from 'tapis-hooks/workflows/pipelines/useListAll';

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

  let respAll: Workflows.RespPipelineList = {
    status: last ? last.status : 'success',
    message: last ? last.message : 'success',
    metadata: last ? last.metadata : {},
    result: pipelines,
    version: last ? last.version : 'latest', // ?
  };

  return respAll;
};

export default listAll;
