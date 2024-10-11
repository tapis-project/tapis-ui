import { Systems } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../utils';

const checkUserCredential = (
  params: Systems.CheckUserCredentialRequest,
  basePath: string,
  jwt: string
) => {
  const api: Systems.CredentialsApi = apiGenerator<Systems.CredentialsApi>(
    Systems,
    Systems.CredentialsApi,
    basePath,
    jwt
  );
  return errorDecoder<Systems.RespBasic>(() => api.checkUserCredential(params));
};

export default checkUserCredential;
