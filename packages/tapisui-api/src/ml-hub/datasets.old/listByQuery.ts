import { Datasets } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../../utils';

const listByQuery = (
  params: Datasets.ListDatasetsByQueryRequest,
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
    api.listDatasetsByQuery(params)
  );
};

export default listByQuery;
