import { useMutation, MutateOptions } from 'react-query';
import { Jobs } from '@tapis/tapis-typescript';
import { Jobs as API } from '@tapis/tapisui-api';
import { useTapisConfig } from '../';
import QueryKeys from './queryKeys';

const useCancel = () => {
  const { basePath, accessToken } = useTapisConfig();
  const jwt = accessToken?.access_token || '';

  // The useMutation react-query hook is used to call operations that make server-side changes
  // (Other hooks would be used for data retrieval)
  //
  // In this case, move helper is called to perform the operation
  const {
    mutate,
    mutateAsync,
    isLoading,
    isError,
    isSuccess,
    data,
    error,
    reset,
  } = useMutation<Jobs.RespCancelJob, Error, Jobs.CancelJobRequest>(
    [QueryKeys.cancel, basePath, jwt],
    (jobCancelReq) => API.cancel(jobCancelReq, basePath, jwt)
  );

  // Return hook object with loading states and login function
  return {
    isLoading,
    isError,
    isSuccess,
    data,
    error,
    reset,
    cancel: (
      jobCancelReq: Jobs.CancelJobRequest,
      // react-query options to allow callbacks such as onSuccess
      options?: MutateOptions<Jobs.RespCancelJob, Error, Jobs.CancelJobRequest>
    ) => {
      // Call mutate to trigger a single post-like API operation
      return mutate(jobCancelReq, options);
    },
    cancelAsync: (
      jobCancelReq: Jobs.CancelJobRequest,
      options?: MutateOptions<Jobs.RespCancelJob, Error, Jobs.CancelJobRequest>
    ) => mutateAsync(jobCancelReq, options),
  };
};

export default useCancel;
