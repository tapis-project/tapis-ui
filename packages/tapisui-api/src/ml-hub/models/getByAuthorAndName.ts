import * as Models from '@mlhub/models-ts-sdk';
import { apiGenerator, errorDecoder } from '../../utils';

const getByAuthorAndName = (
  params: Models.GetModelByAuthorAndNameRequest,
  basePath: string,
  jwt: string
) => {
  const api: Models.ModelsApi = apiGenerator<Models.ModelsApi>(
    Models,
    Models.ModelsApi,
    basePath,
    jwt
  );

  return errorDecoder<Models.GetModelResponse>(() =>
    api.getModelByAuthorAndName(params)
  );
};

export default getByAuthorAndName;
