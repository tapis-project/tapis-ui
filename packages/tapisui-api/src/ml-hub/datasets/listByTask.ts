import { Datasets } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../../utils';

const listByTask = (
  params: Datasets.ListDatasetsByTaskRequest,
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
    api.listDatasetsByTask(params)
  );
};

export default listByTask;
