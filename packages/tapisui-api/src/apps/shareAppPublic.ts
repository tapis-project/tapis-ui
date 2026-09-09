import { Apps } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../utils';

const shareAppPublic = (appId: string, basePath: string, jwt: string) => {
  const api: Apps.SharingApi = apiGenerator<Apps.SharingApi>(
    Apps,
    Apps.SharingApi,
    basePath,
    jwt
  );
  return errorDecoder<Apps.RespBasic>(() => api.shareAppPublic({ appId }));
};

export default shareAppPublic;
