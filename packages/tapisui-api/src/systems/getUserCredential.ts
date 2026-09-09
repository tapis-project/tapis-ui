import { Systems } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../utils';

// GET /v3/systems/credential/{systemId}/user/{userName} — a registry
// lookup ("is one stored, and of what kinds"), NOT a connection attempt.
// The cheap first half of a two-step credential check; checkUserCredential
// is the expensive second half.
const getUserCredential = (
  params: Systems.GetUserCredentialRequest,
  basePath: string,
  jwt: string
) => {
  const api: Systems.CredentialsApi = apiGenerator<Systems.CredentialsApi>(
    Systems,
    Systems.CredentialsApi,
    basePath,
    jwt
  );
  return errorDecoder<Systems.RespCredential>(() =>
    api.getUserCredential(params)
  );
};

export default getUserCredential;
