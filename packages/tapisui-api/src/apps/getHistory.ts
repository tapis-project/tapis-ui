import { Apps } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../utils';

const getHistory = (
  params: Apps.GetHistoryRequest,
  basePath: string,
  jwt: string
) => {
  const api: Apps.ApplicationsApi = apiGenerator<Apps.ApplicationsApi>(
    Apps,
    Apps.ApplicationsApi,
    basePath,
    jwt
  );
  return errorDecoder<Apps.RespAppHistory>(() => api.getHistory(params));
};

export default getHistory;
