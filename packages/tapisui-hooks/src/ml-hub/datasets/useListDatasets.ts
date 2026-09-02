import { useQuery, QueryObserverOptions } from 'react-query';
import { MLHub as API } from '@tapis/tapisui-api';
import * as Datasets from '@mlhub/datasets-ts-sdk';
import { useTapisConfig } from '../..';
import QueryKeys from './queryKeys';

const useListDatasets = (
  options: QueryObserverOptions<Datasets.ListDatasetsResponse, Error> = {}
) => {
  const { accessToken, mlHubBasePath } = useTapisConfig();

  return useQuery<Datasets.ListDatasetsResponse, Error>(
    [QueryKeys.listDatasets, accessToken],
    () =>
      API.Datasets.listDatasets(mlHubBasePath, accessToken?.access_token ?? ''),
    {
      ...options,
      enabled: !!accessToken && options.enabled !== false,
    }
  );
};

export default useListDatasets;
