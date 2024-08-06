import { Models } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../../utils';

const details = (
  params: Models.GetModelRequest,
  basePath: string,
  jwt: string
) => {
  const api: Models.ModelsApi = apiGenerator<Models.ModelsApi>(
    Models,
    Models.ModelsApi,
    basePath,
    jwt
  );
  return errorDecoder<Models.RespModel>(() => api.getModel(params));
};

export default details;
