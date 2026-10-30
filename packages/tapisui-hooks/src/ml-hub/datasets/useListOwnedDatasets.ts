import { QueryObserverOptions, useQuery } from 'react-query';
import { MLHub as API } from '@tapis/tapisui-api';
import * as Datasets from '@mlhub/datasets-ts-sdk';
import { useTapisConfig } from '../..';
import QueryKeys from './queryKeys';

export type ListOwnedDatasetsParams = Omit<
  Parameters<Datasets.DatasetsApi['listDatasets']>[0],
  'scope'
>;

const useListOwnedDatasets = (
  params: ListOwnedDatasetsParams = {},
  options: QueryObserverOptions<Datasets.ListDatasetsResponse, Error> = {}
) => {
  const { accessToken, mlHubBasePath } = useTapisConfig();

  return useQuery<Datasets.ListDatasetsResponse, Error>(
    [QueryKeys.listOwnedDatasets, params, accessToken],
    () =>
      API.Datasets.listDatasets(
        { ...params, scope: Datasets.ListDatasetsScopeEnum.Owned },
        mlHubBasePath,
        accessToken?.access_token ?? ''
      ),
    {
      ...options,
      enabled: !!accessToken && options.enabled !== false,
    }
  );
};

export default useListOwnedDatasets;
