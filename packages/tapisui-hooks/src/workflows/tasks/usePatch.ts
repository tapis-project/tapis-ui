import { useMutation, MutateOptions } from 'react-query';
import { Workflows } from '@tapis/tapis-typescript';
import { Workflows as API } from '@tapis/tapisui-api';
import { useTapisConfig } from '../../';
import QueryKeys from './queryKeys';
import { default as PipelinesQueryKeys } from '../pipelines/queryKeys';
import { useQueryClient } from 'react-query';

type PatchTaskHooksParams = Workflows.PatchTaskRequest;

const usePatch = () => {
  const { basePath, accessToken } = useTapisConfig();
  const jwt = accessToken?.access_token || '';
  const queryClient = useQueryClient();

  const { mutate, isLoading, isError, isSuccess, data, error, reset } =
    useMutation<Workflows.RespTask, Error, PatchTaskHooksParams>(
      [QueryKeys.patch, basePath, jwt],
      (params) => API.Tasks.patch(params, basePath, jwt)
    );

  const invalidate = () => {
    queryClient.invalidateQueries(QueryKeys.list);
    queryClient.invalidateQueries(PipelinesQueryKeys.details);
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
      params: PatchTaskHooksParams,
      // react-query options to allow callbacks such as onSuccess
      options?: MutateOptions<Workflows.RespTask, Error, PatchTaskHooksParams>
    ) => {
      // Call mutate to trigger a single post-like API operation
      return mutate(params, options);
    },
  };
};

export default usePatch;
