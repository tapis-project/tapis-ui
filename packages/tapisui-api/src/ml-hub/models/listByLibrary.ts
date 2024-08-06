import { Models } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../../utils';

const listByLibrary = (
  params: Models.ListModelsByLibraryRequest,
  basePath: string,
  jwt: string
) => {
  const api: Models.ModelsApi = apiGenerator<Models.ModelsApi>(
    Models,
    Models.ModelsApi,
    basePath,
    jwt
  );
  return errorDecoder<Models.RespModelsObject>(() =>
    api.listModelsByLibrary(params)
  );
};

export default listByLibrary;
