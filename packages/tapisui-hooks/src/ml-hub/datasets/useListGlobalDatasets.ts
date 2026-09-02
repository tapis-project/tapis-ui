import { useQuery, QueryObserverOptions } from 'react-query';
import { MLHub as API } from '@tapis/tapisui-api';
import * as Datasets from '@mlhub/datasets-ts-sdk';
import { useTapisConfig } from '../..';
import QueryKeys from './queryKeys';

export type ListGlobalDatasetsParams = Omit<
  Parameters<Datasets.DatasetsApi['listDatasets']>[0],
  'scope'
>;

const useListGlobalDatasets = (
  params: ListGlobalDatasetsParams = {},
  options: QueryObserverOptions<Datasets.ListDatasetsResponse, Error> = {}
) => {
  const { accessToken, mlHubBasePath } = useTapisConfig();

  return useQuery<Datasets.ListDatasetsResponse, Error>(
    [QueryKeys.listGlobalDatasets, params, accessToken],
    () =>
      API.Datasets.listDatasets(
        { ...params, scope: Datasets.ListDatasetsScopeEnum.Global },
        mlHubBasePath,
        accessToken?.access_token ?? ''
      ),
    {
      ...options,
      enabled: !!accessToken && options.enabled !== false,
    }
  );
};

export default useListGlobalDatasets;
