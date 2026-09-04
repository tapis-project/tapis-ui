import { MutateOptions, useMutation, useQueryClient } from 'react-query';
import * as Datasets from '@mlhub/datasets-ts-sdk';
import { MLHub as API } from '@tapis/tapisui-api';
import { useTapisConfig } from '../..';
import QueryKeys from './queryKeys';

export type ForkDatasetParams = {
  /** The registered dataset to copy into the current user's collection. */
  dataset: Datasets.Dataset;
  /** Defaults to "Fork of <source name>". */
  name?: string;
  /** Defaults to Private so a fork is not published unintentionally. */
  visibility?: Datasets.Visibility;
};

const useForkDataset = () => {
  const { accessToken, mlHubBasePath } = useTapisConfig();
  const jwt = accessToken?.access_token ?? '';
  const queryClient = useQueryClient();

  const { mutate, isLoading, isError, isSuccess, data, error, reset } =
    useMutation<Datasets.RegisterDatasetResponse, Error, ForkDatasetParams>(
      [QueryKeys.forkDataset, mlHubBasePath, jwt],
      ({ dataset, name, visibility }) =>
        API.Datasets.registerDataset(
          {
            registerDatasetBody: {
              description: dataset.description,
              huggingface_repo_locator: dataset.huggingface_repo_locator,
              items: dataset.items,
              name: name ?? `Fork of ${dataset.name}`,
              provider: dataset.provider,
              size: dataset.size,
              tags: dataset.tags,
              tapis_system_locator: dataset.tapis_system_locator,
              visibility: visibility ?? Datasets.Visibility.Private,
            },
          },
          mlHubBasePath,
          jwt
        ),
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
    forkDataset: (
      params: ForkDatasetParams,
      options?: MutateOptions<
        Datasets.RegisterDatasetResponse,
        Error,
        ForkDatasetParams
      >
    ) => mutate(params, options),
  };
};

export default useForkDataset;
