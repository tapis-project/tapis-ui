import { Systems } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../utils';

const makeNewSystem = (
  reqCreateSystem: Systems.CreateSystemRequest,
  basePath: string,
  jwt: string
) => {
  const api: Systems.SystemsApi = apiGenerator<Systems.SystemsApi>(
    Systems,
    Systems.SystemsApi,
    basePath,
    jwt
  );
  return errorDecoder<Systems.RespBasic>(() =>
    api.createSystem(reqCreateSystem)
  );
};

export default makeNewSystem;
