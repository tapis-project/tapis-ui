import { Models } from '@mlhub/ts-sdk';
import { apiGenerator, errorDecoder } from '../../../utils';

const list = (basePath: string, jwt: string) => {
  const api: Models.PlatformsApi = apiGenerator<Models.PlatformsApi>(
    Models,
    Models.PlatformsApi,
    basePath,
    jwt
  );
  return errorDecoder<Models.ListPlatformsResponse>(() => api.listPlatforms());
};

export default list;
