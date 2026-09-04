import * as Datasets from '@mlhub/datasets-ts-sdk';
import { apiGenerator, errorDecoder } from '../../utils';

export type RegisterDatasetParams = Parameters<
  Datasets.DatasetsApi['registerDataset']
>[0];

const registerDataset = (
  params: RegisterDatasetParams,
  basePath: string,
  jwt: string
) => {
  const api: Datasets.DatasetsApi = apiGenerator<Datasets.DatasetsApi>(
    Datasets,
    Datasets.DatasetsApi,
    basePath,
    jwt
  );

  return errorDecoder<Datasets.RegisterDatasetResponse>(() =>
    api.registerDataset(params)
  );
};

export default registerDataset;
