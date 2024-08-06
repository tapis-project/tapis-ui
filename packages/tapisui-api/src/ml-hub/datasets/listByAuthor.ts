import { Datasets } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../../utils';

const listByAuthor = (
  params: Datasets.ListDatasetsByAuthorRequest,
  basePath: string,
  jwt: string
) => {
  const api: Datasets.DatasetsApi = apiGenerator<Datasets.DatasetsApi>(
    Datasets,
    Datasets.DatasetsApi,
    basePath,
    jwt
  );
  return errorDecoder<Datasets.RespDatasetsObject>(() =>
    api.listDatasetsByAuthor(params)
  );
};

export default listByAuthor;
