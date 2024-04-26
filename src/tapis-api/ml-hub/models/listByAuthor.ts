import { Models } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from 'tapis-api/utils';

const listByAuthor = (
  params: Models.ListModelsByAuthorRequest,
  basePath: string,
  jwt: string
) => {
  const api: Models.ModelsApi = apiGenerator<Models.ModelsApi>(
    Models,
    Models.ModelsApi,
    basePath,
    jwt
  );
  return errorDecoder<Models.RespModelObject>(() =>
    api.listModelsByAuthor(params)
  );
};

export default listByAuthor;
