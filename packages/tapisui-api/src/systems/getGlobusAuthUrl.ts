import { Systems } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../utils';

const getGlobusAuthUrl = (params: any, basePath: string, jwt: string) => {
  const api: Systems.CredentialsApi = apiGenerator<Systems.CredentialsApi>(
    Systems,
    Systems.CredentialsApi,
    basePath,
    jwt
  );
  return errorDecoder<Systems.RespGlobusAuthUrl>(() =>
    api.getGlobusAuthUrl(params)
  );
};

export default getGlobusAuthUrl;
