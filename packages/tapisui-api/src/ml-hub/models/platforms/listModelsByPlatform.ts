import { Models } from '@mlhub/ts-sdk';
import { apiGenerator, errorDecoder } from '../../../utils';

const listModelsByPlatform = (
  platform: string,
  basePath: string,
  jwt: string
) => {
  const api: Models.PlatformsApi = apiGenerator<Models.PlatformsApi>(
    Models,
    Models.PlatformsApi,
    basePath,
    jwt
  );
  return errorDecoder<Models.ListModelsByPlatformResponse>(() =>
    api.listModelsByPlatform({
      platform: platform as Models.Platform,
    })
  );
};

export default listModelsByPlatform;
