import { Models } from '@mlhub/ts-sdk';
import { apiGenerator, errorDecoder } from '../../../utils';

const getModelByPlatform = (
  platform: string,
  modelId: string,
  basePath: string,
  jwt: string
) => {
  const api: Models.PlatformsApi = apiGenerator<Models.PlatformsApi>(
    Models,
    Models.PlatformsApi,
    basePath,
    jwt
  );
  return errorDecoder<Models.GetModelByPlatformResponse>(() =>
    api.getModelByPlatform({
      platform: platform as Models.Platform,
      modelId,
    })
  );
};

export default getModelByPlatform;
