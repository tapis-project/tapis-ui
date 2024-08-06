import { Systems } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../utils';

const createChildSystem = (
  reqPostChildSystem: Systems.ReqPostChildSystem,
  parentId: string,
  basePath: string,
  jwt: string
) => {
  const api: Systems.ChildSystemsApi = apiGenerator<Systems.ChildSystemsApi>(
    Systems,
    Systems.ChildSystemsApi,
    basePath,
    jwt
  );
  return errorDecoder<Systems.RespBasic>(() =>
    api.createChildSystem({ reqPostChildSystem, parentId })
  );
};

export default createChildSystem;
