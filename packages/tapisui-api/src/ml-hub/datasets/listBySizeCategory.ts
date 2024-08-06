import { Datasets } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../../utils';

const listBySizeCategory = (
  params: Datasets.ListDatasetsBySizeCategoryRequest,
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
    api.listDatasetsBySizeCategory(params)
  );
};

export default listBySizeCategory;
