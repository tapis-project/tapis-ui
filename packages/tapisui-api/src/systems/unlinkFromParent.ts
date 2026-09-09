import { Systems } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../utils';

const unlinkFromParent = (
  params: Systems.UnlinkFromParentRequest,
  basePath: string,
  jwt: string
) => {
  const api: Systems.ChildSystemsApi = apiGenerator<Systems.ChildSystemsApi>(
    Systems,
    Systems.ChildSystemsApi,
    basePath,
    jwt
  );
  return errorDecoder<Systems.RespChangeCount>(() =>
    api.unlinkFromParent(params)
  );
};

export default unlinkFromParent;
