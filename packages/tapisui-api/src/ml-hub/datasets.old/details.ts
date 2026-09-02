import { Datasets } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../../utils';

const details = (
  params: Datasets.GetDatasetRequest,
  basePath: string,
  jwt: string
) => {
  const api: Datasets.DatasetsApi = apiGenerator<Datasets.DatasetsApi>(
    Datasets,
    Datasets.DatasetsApi,
    basePath,
    jwt
  );
  return errorDecoder<Datasets.RespDataset>(() => api.getDataset(params));
};

export default details;
