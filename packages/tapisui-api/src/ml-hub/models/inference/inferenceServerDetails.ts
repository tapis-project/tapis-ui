import { Models } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../../../utils';

const inferenceServerDetails = (
  params: Models.GetModelInferenceServerRequest,
  basePath: string,
  jwt: string
) => {
  const api: Models.ModelsApi = apiGenerator<Models.ModelsApi>(
    Models,
    Models.ModelsApi,
    basePath,
    jwt
  );
  return errorDecoder<Models.RespModelServer>(() =>
    api.getModelInferenceServer(params)
  );
};

export default inferenceServerDetails;
