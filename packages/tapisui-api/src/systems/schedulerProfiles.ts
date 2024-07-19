import { Systems } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../utils';

const listSchedulerProfiles = (basePath: string, jwt: string) => {
  const api: Systems.SchedulerProfilesApi =
    apiGenerator<Systems.SchedulerProfilesApi>(
      Systems,
      Systems.SchedulerProfilesApi,
      basePath,
      jwt
    );
  return errorDecoder<Systems.RespSchedulerProfiles>(() =>
    api.getSchedulerProfiles()
  );
};

export default listSchedulerProfiles;
