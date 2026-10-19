import * as Models from '@mlhub/models-ts-sdk';
import { apiGenerator, errorDecoder } from '../../utils';

const fork = (
  request: Models.CreateModelRequest,
  basePath: string,
  jwt: string
) => {
  const api: Models.ModelsApi = apiGenerator<Models.ModelsApi>(
    Models,
    Models.ModelsApi,
    basePath,
    jwt
  );
  return errorDecoder<Models.CreateModelResponse>(async () => {
    return api.createModel(request);
  });
};

export default fork;
