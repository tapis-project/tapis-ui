import { useMutation, MutateOptions, useQueryClient } from 'react-query';
import * as Models from '@mlhub/models-ts-sdk';
import { MLHub as API } from '@tapis/tapisui-api';
import { useTapisConfig } from '../../';
import QueryKeys from './queryKeys';
import { useEffect } from 'react';

type DiscoverModelsHookParams = {
  options?: {
    autoRunParams?: Models.DiscoverModelsRequest;
  };
};

const useDiscoverModels = ({ options }: DiscoverModelsHookParams) => {
  const { accessToken, basePath, mlHubBasePath } = useTapisConfig();
  const jwt = accessToken?.access_token || '';
  const queryClient = useQueryClient();

  // The useMutation react-query hook is used to call operations that make server-side changes
  // (Other hooks would be used for data retrieval)
  //
  // In this case, create helper is called to perform the operation
  const { mutate, isLoading, isError, isSuccess, data, error, reset } =
    useMutation<
      Models.DiscoverModelsResponse,
      Error,
      Models.DiscoverModelsRequest
    >([QueryKeys.discover, mlHubBasePath, jwt], (params) =>
      API.Models.discover(params, mlHubBasePath, jwt)
    );

  useEffect(() => {
    if (options?.autoRunParams !== undefined) {
      mutate(options.autoRunParams);
    }
  }, []);

  const invalidate = () => {
    queryClient.invalidateQueries(QueryKeys.discover);
  };

  // Return hook object with loading states and login function
  return {
    isLoading,
    isError,
    isSuccess,
    data,
    error,
    reset,
    invalidate,
    discover: (
      params: Models.DiscoverModelsRequest,
      // react-query options to allow callbacks such as onSuccess
      options?: MutateOptions<
        Models.DiscoverModelsResponse,
        Error,
        Models.DiscoverModelsRequest
      >
    ) => {
      // Call mutate to trigger a single post-like API operation
      return mutate(params, options);
    },
  };
};

export default useDiscoverModels;
