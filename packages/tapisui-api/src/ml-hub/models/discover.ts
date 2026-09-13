import * as Models from '@mlhub/models-ts-sdk';
import { apiGenerator, errorDecoder } from '../../utils';

const discover = (
  request: Models.DiscoverExternalModelsRequest,
  basePath: string,
  jwt: string
) => {
  const api: Models.ExternalModelsApi = apiGenerator<Models.ExternalModelsApi>(
    Models,
    Models.ExternalModelsApi,
    basePath,
    jwt
  );
  return errorDecoder<Models.DiscoverExternalModelsResponse>(async () => {
    return api.discoverExternalModels(request);
  });
};

export default discover;
