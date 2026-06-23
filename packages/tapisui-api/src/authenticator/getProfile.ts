import { Authenticator } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../utils';

const getProfile = (
  params: Authenticator.GetProfileRequest,
  basePath: string,
  jwt: string
): Promise<Authenticator.RespGetProfile> => {
  const api: Authenticator.ProfilesApi =
    apiGenerator<Authenticator.ProfilesApi>(
      Authenticator,
      Authenticator.ProfilesApi,
      basePath,
      jwt
    );
  return errorDecoder<Authenticator.RespGetProfile>(() =>
    api.getProfile(params)
  );
};

export default getProfile;
