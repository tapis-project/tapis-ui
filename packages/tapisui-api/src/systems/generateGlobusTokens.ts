import { Systems } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../utils';

const generateGlobusTokens = (
  params: Systems.GenerateGlobusTokensRequest,
  basePath: string,
  jwt: string
) => {
  const api: Systems.CredentialsApi = apiGenerator<Systems.CredentialsApi>(
    Systems,
    Systems.CredentialsApi,
    basePath,
    jwt
  );
  return errorDecoder<Systems.RespBasic>(() =>
    api.generateGlobusTokens(params)
  );
};

export default generateGlobusTokens;
