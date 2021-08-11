import { Systems } from '@tapis/tapis-typescript';
import { queryHelper } from 'tapis-api/utils';

const list = (params: Systems.GetSystemsRequest, basePath: string, jwt: string) => {
  return queryHelper<Systems.RespSystems>({
    module: Systems,
    api: Systems.SystemsApi,
    func: Systems.SystemsApi.prototype.getSystems,
    args: [params],
    basePath,
    jwt
  });
}

export default list;