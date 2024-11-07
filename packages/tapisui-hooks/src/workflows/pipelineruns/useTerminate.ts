import { useMutation, MutateOptions, useQueryClient } from 'react-query';
import { Workflows } from '@tapis/tapis-typescript';
import { Workflows as API } from '@tapis/tapisui-api';
import { useTapisConfig } from '../../';
import QueryKeys from './queryKeys';

const useTerminate = () => {
  const { basePath, accessToken } = useTapisConfig();
  const jwt = accessToken?.access_token || '';
  const { mutate, isLoading, isError, isSuccess, data, error, reset } =
    useMutation<
      Workflows.RespPipelineRun,
      Error,
      Workflows.TerminatePipelineRequest
    >([QueryKeys.terminate, basePath, jwt], (params) =>
      API.PipelineRuns.terminate(params, basePath, jwt)
    );
  const queryClient = useQueryClient();
  const invalidate = () => {
    queryClient.invalidateQueries([QueryKeys.list, QueryKeys.details]);
  };

  return {
    isLoading,
    isError,
    isSuccess,
    data,
    error,
    reset,
    invalidate,
    terminate: (
      params: Workflows.TerminatePipelineRequest,
      options?: MutateOptions<
        Workflows.RespPipelineRun,
        Error,
        Workflows.TerminatePipelineRequest
      >
    ) => {
      return mutate(params, options);
    },
  };
};

export default useTerminate;
