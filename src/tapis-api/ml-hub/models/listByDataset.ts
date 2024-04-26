import { Models } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from 'tapis-api/utils';

const listByDataset = (
  params: Models.ListModelsByDatasetRequest,
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
    api.listModelsByDataset(params)
  );
};

export default listByDataset;
