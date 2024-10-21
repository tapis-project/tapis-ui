import { Systems } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../utils';

const shareSystem = (
  params: Systems.ShareSystemRequest,
  basePath: string,
  jwt: string
) => {
  const api: Systems.SharingApi = apiGenerator<Systems.SharingApi>(
    Systems,
    Systems.SharingApi,
    basePath,
    jwt
  );
  return errorDecoder<Systems.RespBasic>(() => api.shareSystem(params));
};

export default shareSystem;
