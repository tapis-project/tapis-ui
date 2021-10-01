import { Streams } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from 'tapis-api/utils';

const list = (
  params: Streams.ListSitesRequest,
  basePath: string,
  jwt: string
) => {
  const api: Streams.SitesApi = apiGenerator<Streams.SitesApi>(
    Streams,
    Streams.SitesApi,
    basePath,
    jwt
  );
  return errorDecoder<Streams.RespListSites>(() => api.listSites(params));
};

export default list;
