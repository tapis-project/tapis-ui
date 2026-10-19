import { QueryObserverOptions, useQuery } from 'react-query';
import { MLHub as API } from '@tapis/tapisui-api';
import * as Datasets from '@mlhub/datasets-ts-sdk';
import { useTapisConfig } from '../..';
import QueryKeys from './queryKeys';

export type ListSharedDatasetsParams = Omit<
  Parameters<Datasets.DatasetsApi['listDatasets']>[0],
  'scope'
>;

const useListSharedDatasets = (
  params: ListSharedDatasetsParams = {},
  options: QueryObserverOptions<Datasets.ListDatasetsResponse, Error> = {}
) => {
  const { accessToken, mlHubBasePath } = useTapisConfig();

  return useQuery<Datasets.ListDatasetsResponse, Error>(
    [QueryKeys.listSharedDatasets, params, accessToken],
    () =>
      API.Datasets.listDatasets(
        { ...params, scope: Datasets.ListDatasetsScopeEnum.Shared },
        mlHubBasePath,
        accessToken?.access_token ?? ''
      ),
    {
      ...options,
      enabled: !!accessToken && options.enabled !== false,
    }
  );
};

export default useListSharedDatasets;
