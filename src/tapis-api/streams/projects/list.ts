import { Streams } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from 'tapis-api/utils';

const list = (
  params: Streams.ListProjectsRequest,
  basePath: string,
  jwt: string
) => {
  const api: Streams.ProjectsApi = apiGenerator<Streams.ProjectsApi>(
    Streams,
    Streams.ProjectsApi,
    basePath,
    jwt
  );
  return errorDecoder<Streams.RespListProjects>(() => api.listProjects(params));
};

export default list;
