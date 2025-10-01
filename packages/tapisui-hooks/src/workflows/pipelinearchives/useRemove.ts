import { useMutation, MutateOptions, useQueryClient } from 'react-query';
import { Workflows } from '@tapis/tapis-typescript';
import { Workflows as API } from '@tapis/tapisui-api';
import { useTapisConfig } from '../..';
import QueryKeys from './queryKeys';
import PipelineQueryKeys from '../pipelines/queryKeys';

type RemoveArchiveHookParams = Workflows.RemovePipelineArchiveRequest;

const useRemove = () => {
  const { basePath, accessToken } = useTapisConfig();
  const jwt = accessToken?.access_token || '';
  const queryClient = useQueryClient();

  // The useMutation react-query hook is used to call operations that make server-side changes
  // (Other hooks would be used for data retrieval)
  const { mutate, isLoading, isError, isSuccess, data, error, reset } =
    useMutation<Workflows.RespResourceURL, Error, RemoveArchiveHookParams>(
      [QueryKeys.remove, basePath, jwt],
      (params) => API.PipelineArchives.remove(params, basePath, jwt)
    );

  const invalidate = () => {
    queryClient.invalidateQueries([PipelineQueryKeys.details, QueryKeys.list]);
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
    remove: (
      params: RemoveArchiveHookParams,
      // react-query options to allow callbacks such as onSuccess
      options?: MutateOptions<
        Workflows.RespResourceURL,
        Error,
        RemoveArchiveHookParams
      >
    ) => {
      // Call mutate to trigger a single post-like API operation
      return mutate(params, options);
    },
  };
};

export default useRemove;
