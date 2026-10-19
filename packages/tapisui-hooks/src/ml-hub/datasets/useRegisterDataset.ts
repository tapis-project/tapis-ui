import { MutateOptions, useMutation, useQueryClient } from 'react-query';
import { MLHub as API } from '@tapis/tapisui-api';
import * as Datasets from '@mlhub/datasets-ts-sdk';
import { useTapisConfig } from '../..';
import QueryKeys from './queryKeys';

export type RegisterDatasetParams = Parameters<
  Datasets.DatasetsApi['registerDataset']
>[0];

const useRegisterDataset = () => {
  const { accessToken, mlHubBasePath } = useTapisConfig();
  const jwt = accessToken?.access_token ?? '';
  const queryClient = useQueryClient();

  const { mutate, isLoading, isError, isSuccess, data, error, reset } =
    useMutation<Datasets.RegisterDatasetResponse, Error, RegisterDatasetParams>(
      [QueryKeys.registerDataset, mlHubBasePath, jwt],
      (params) => API.Datasets.registerDataset(params, mlHubBasePath, jwt),
      {
        onSuccess: () => {
          queryClient.invalidateQueries(QueryKeys.listOwnedDatasets);
          queryClient.invalidateQueries(QueryKeys.listSharedDatasets);
          queryClient.invalidateQueries(QueryKeys.listGlobalDatasets);
        },
      }
    );

  return {
    isLoading,
    isError,
    isSuccess,
    data,
    error,
    reset,
    registerDataset: (
      params: RegisterDatasetParams,
      options?: MutateOptions<
        Datasets.RegisterDatasetResponse,
        Error,
        RegisterDatasetParams
      >
    ) => mutate(params, options),
  };
};

export default useRegisterDataset;
