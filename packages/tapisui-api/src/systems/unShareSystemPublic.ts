import { Systems } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../utils';

const unShareSystemPublic = (
  systemId: string,
  basePath: string,
  jwt: string
) => {
  const api: Systems.SharingApi = apiGenerator<Systems.SharingApi>(
    Systems,
    Systems.SharingApi,
    basePath,
    jwt
  );
  return errorDecoder<Systems.RespBasic>(() =>
    api.unShareSystemPublic({ systemId })
  );
};

export default unShareSystemPublic;
