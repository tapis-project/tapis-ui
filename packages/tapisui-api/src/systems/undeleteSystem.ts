import { Systems } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../utils';

const undeleteSystem = (systemId: string, basePath: string, jwt: string) => {
  const api: Systems.SystemsApi = apiGenerator<Systems.SystemsApi>(
    Systems,
    Systems.SystemsApi,
    basePath,
    jwt
  );
  return errorDecoder<Systems.RespBasic>(() =>
    api.undeleteSystem({ systemId })
  );
};

export default undeleteSystem;
