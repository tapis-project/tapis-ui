import * as Datasets from '@mlhub/datasets-ts-sdk';
import { apiGenerator, errorDecoder } from '../../utils';

export type GetDatasetParams = Parameters<
  Datasets.DatasetsApi['getDataset']
>[0];

const getDataset = (
  params: GetDatasetParams,
  basePath: string,
  jwt: string
) => {
  const api: Datasets.DatasetsApi = apiGenerator<Datasets.DatasetsApi>(
    Datasets,
    Datasets.DatasetsApi,
    basePath,
    jwt
  );

  return errorDecoder<Datasets.GetDatasetResponse>(() =>
    api.getDataset(params)
  );
};

export default getDataset;
