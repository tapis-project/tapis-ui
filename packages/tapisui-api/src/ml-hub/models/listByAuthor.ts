import * as Models from '@mlhub/models-ts-sdk';
import { apiGenerator, errorDecoder } from '../../utils';

export type ListModelsByAuthorParams = Models.ListModelsRequest & {
  author?: string;
};

const listByAuthor = (
  params: ListModelsByAuthorParams,
  basePath: string,
  jwt: string
) => {
  const api: Models.ModelsApi = apiGenerator<Models.ModelsApi>(
    Models,
    Models.ModelsApi,
    basePath,
    jwt
  );
  return errorDecoder<Models.ListModelsResponse>(async () => {
    const { author: _author, ...listParams } = params;
    const response = await api.listModels({
      ...listParams,
      scope: Models.ListModelsScopeEnum.Owned,
    });
    return response;
  });
};

export default listByAuthor;
