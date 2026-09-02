import * as Datasets from '@mlhub/datasets-ts-sdk';
import { apiGenerator, errorDecoder } from '../../utils';

export type ListDatasetsParams = Parameters<
  Datasets.DatasetsApi['listDatasets']
>[0];

const listDatasets = (
  params: ListDatasetsParams | undefined,
  basePath: string,
  jwt: string
) => {
  const api: Datasets.DatasetsApi = apiGenerator<Datasets.DatasetsApi>(
    Datasets,
    Datasets.DatasetsApi,
    basePath,
    jwt
  );

  return errorDecoder<Datasets.ListDatasetsResponse>(() =>
    api.listDatasets(params ?? {})
  );
};

export default listDatasets;
