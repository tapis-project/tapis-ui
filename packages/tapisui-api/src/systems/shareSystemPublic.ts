import { Systems } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../utils';

const shareSystemPublic = (systemId: string, basePath: string, jwt: string) => {
  const api: Systems.SharingApi = apiGenerator<Systems.SharingApi>(
    Systems,
    Systems.SharingApi,
    basePath,
    jwt
  );
  return errorDecoder<Systems.RespBasic>(() =>
    api.shareSystemPublic({ systemId })
  );
};

export default shareSystemPublic;
