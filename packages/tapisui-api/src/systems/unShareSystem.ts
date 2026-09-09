import { Systems } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../utils';

const unShareSystem = (
  params: Systems.UnShareSystemRequest,
  basePath: string,
  jwt: string
) => {
  const api: Systems.SharingApi = apiGenerator<Systems.SharingApi>(
    Systems,
    Systems.SharingApi,
    basePath,
    jwt
  );
  return errorDecoder<Systems.RespBasic>(() => api.unShareSystem(params));
};

export default unShareSystem;
