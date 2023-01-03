import { useMutation, MutateOptions } from 'react-query';
import { Workflows } from '@tapis/tapis-typescript';
import { run } from 'tapis-api/workflows/pipelines';
import { useTapisConfig } from 'tapis-hooks';
import QueryKeys from './queryKeys';

type RunPipelineHookParams = Workflows.RunPipelineRequest;

const useRun = () => {
  const { basePath, accessToken } = useTapisConfig();
  const jwt = accessToken?.access_token || '';

  // The useMutation react-query hook is used to call operations that make server-side changes
  // (Other hooks would be used for data retrieval)
  const { mutate, isLoading, isError, isSuccess, data, error, reset } =
    useMutation<Workflows.RespEvent, Error, RunPipelineHookParams>(
      [QueryKeys.run, basePath, jwt],
      (params) => run(params, basePath, jwt)
    );

  // Return hook object with loading states and login function
  return {
    isLoading,
    isError,
    isSuccess,
    data,
    error,
    reset,
    run: (
      params: RunPipelineHookParams,
      // react-query options to allow callbacks such as onSuccess
      options?: MutateOptions<Workflows.RespEvent, Error, RunPipelineHookParams>
    ) => {
      // Call mutate to trigger a single post-like API operation
      return mutate(params, options);
    },
  };
};

export default useRun;
