import * as Datasets from '@mlhub/datasets-ts-sdk';
import { apiGenerator, errorDecoder } from '../../utils';

const listDatasets = (basePath: string, jwt: string) => {
  const api: Datasets.DatasetsApi = apiGenerator<Datasets.DatasetsApi>(
    Datasets,
    Datasets.DatasetsApi,
    basePath,
    jwt
  );

  return errorDecoder<Datasets.ListDatasetsResponse>(() => api.listDatasets());
};

export default listDatasets;
