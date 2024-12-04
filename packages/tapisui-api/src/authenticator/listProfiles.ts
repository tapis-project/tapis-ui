import { Authenticator } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../utils';

const listProfiles = (
  params: Authenticator.ListProfilesRequest,
  basePath: string,
  jwt: string
) => {
  const api: Authenticator.ProfilesApi =
    apiGenerator<Authenticator.ProfilesApi>(
      Authenticator,
      Authenticator.ProfilesApi,
      basePath,
      jwt
    );
  return errorDecoder<Authenticator.RespListProfiles>(() =>
    api.listProfiles(params)
  );
};

export default listProfiles;
