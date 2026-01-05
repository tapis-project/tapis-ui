import { Models } from '@mlhub/ts-sdk';
import { apiGenerator, errorDecoder } from '../../utils';

const discover = (
  request: Models.DiscoverModelsRequest,
  basePath: string,
  jwt: string
) => {
  const api: Models.ModelsApi = apiGenerator<Models.ModelsApi>(
    Models,
    Models.ModelsApi,
    basePath,
    jwt
  );
  return errorDecoder<Models.DiscoverModelsResponse>(() =>
    api.discoverModels(request)
  );
};

export default discover;
