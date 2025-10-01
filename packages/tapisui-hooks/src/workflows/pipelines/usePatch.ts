import { useMutation, MutateOptions } from 'react-query';
import { Workflows } from '@tapis/tapis-typescript';
import { Workflows as API } from '@tapis/tapisui-api';
import { useTapisConfig } from '../..';
import QueryKeys from './queryKeys';
import { useQueryClient } from 'react-query';

type PatchPipelineHookParams = Workflows.PatchPipelineRequest;

const usePatch = () => {
  const { basePath, accessToken } = useTapisConfig();
  const jwt = accessToken?.access_token || '';
  const queryClient = useQueryClient();

  // The useMutation react-query hook is used to call operations that make server-side changes
  // (Other hooks would be used for data retrieval)
  //
  // In this case, patch helper is called to perform the operation
  const { mutate, isLoading, isError, isSuccess, data, error, reset } =
    useMutation<Workflows.RespResourceURL, Error, PatchPipelineHookParams>(
      [QueryKeys.patch, basePath, jwt],
      (params) => API.Pipelines.patch(params, basePath, jwt)
    );

  const invalidate = () => {
    queryClient.invalidateQueries(QueryKeys.details);
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
    patch: (
      params: PatchPipelineHookParams,
      // react-query options to allow callbacks such as onSuccess
      options?: MutateOptions<
        Workflows.RespResourceURL,
        Error,
        PatchPipelineHookParams
      >
    ) => {
      // Call mutate to trigger a single post-like API operation
      return mutate(params, options);
    },
  };
};

export default usePatch;
