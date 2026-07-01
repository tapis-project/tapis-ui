import { useMutation, MutateOptions, useQueryClient } from 'react-query';
import * as Models from '@mlhub/models-ts-sdk';
import { MLHub as API } from '@tapis/tapisui-api';
import { useTapisConfig } from '../../';
import QueryKeys from './queryKeys';

const useCreateModel = () => {
  const { accessToken, mlHubBasePath } = useTapisConfig();
  const jwt = accessToken?.access_token || '';
  const queryClient = useQueryClient();

  const { mutate, isLoading, isError, isSuccess, data, error, reset } =
    useMutation<
      Models.CreateModelMetadataResponse,
      Error,
      Models.CreateModelMetadataRequest
    >([QueryKeys.create, mlHubBasePath, jwt], (params) =>
      API.Models.create(params, mlHubBasePath, jwt)
    );

  const invalidate = () => {
    queryClient.invalidateQueries(QueryKeys.create);
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
    create: (
      params: Models.CreateModelMetadataRequest,
      // react-query options to allow callbacks such as onSuccess
      options?: MutateOptions<
        Models.CreateModelMetadataResponse,
        Error,
        Models.CreateModelMetadataRequest
      >
    ) => {
      // Call mutate to trigger a single post-like API operation
      return mutate(params, options);
    },
  };
};

export default useCreateModel;
