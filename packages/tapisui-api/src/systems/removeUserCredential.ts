import { Systems } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../utils';

const removeUserCredential = (
  params: Systems.RemoveUserCredentialRequest,
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
    api.removeUserCredential(params)
  );
};

export default removeUserCredential;
