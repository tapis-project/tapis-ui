import { useMutation, MutateOptions, useQueryClient } from 'react-query';
import * as Models from '@mlhub/models-ts-sdk';
import { MLHub as API } from '@tapis/tapisui-api';
import { useTapisConfig } from '../../';
import QueryKeys from './queryKeys';

const useForkModel = () => {
  const { accessToken, mlHubBasePath } = useTapisConfig();
  const jwt = accessToken?.access_token || '';
  const queryClient = useQueryClient();

  const { mutate, isLoading, isError, isSuccess, data, error, reset } =
    useMutation<Models.ForkModelResponse, Error, Models.ForkModelRequest>(
      [QueryKeys.fork, mlHubBasePath, jwt],
      (params) => API.Models.fork(params, mlHubBasePath, jwt)
    );

  const invalidate = () => {
    queryClient.invalidateQueries([
      QueryKeys.list,
      QueryKeys.getByAuthorAndName,
    ]);
  };

  return {
    isLoading,
    isError,
    isSuccess,
    data,
    error,
    reset,
    invalidate,
    fork: (
      params: Models.ForkModelRequest,
      // react-query options to allow callbacks such as onSuccess
      options?: MutateOptions<
        Models.ForkModelResponse,
        Error,
        Models.ForkModelRequest
      >
    ) => {
      // Call mutate to trigger a single post-like API operation
      return mutate(params, options);
    },
  };
};

export default useForkModel;
