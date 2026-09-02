import { useQuery, QueryObserverOptions } from 'react-query';
import { MLHub as API } from '@tapis/tapisui-api';
import * as Datasets from '@mlhub/datasets-ts-sdk';
import { useTapisConfig } from '../..';
import QueryKeys from './queryKeys';

type GetDatasetParams = Parameters<Datasets.DatasetsApi['getDataset']>[0];

const useGetDataset = (
  params: GetDatasetParams | undefined,
  options: QueryObserverOptions<Datasets.GetDatasetResponse, Error> = {}
) => {
  const { accessToken, mlHubBasePath } = useTapisConfig();

  return useQuery<Datasets.GetDatasetResponse, Error>(
    [QueryKeys.getDataset, params, accessToken],
    () => {
      if (!params) {
        throw new Error('Dataset request parameters are required');
      }

      return API.Datasets.getDataset(
        params,
        mlHubBasePath,
        accessToken?.access_token ?? ''
      );
    },
    {
      ...options,
      enabled: !!accessToken && !!params && options.enabled !== false,
    }
  );
};

export default useGetDataset;
