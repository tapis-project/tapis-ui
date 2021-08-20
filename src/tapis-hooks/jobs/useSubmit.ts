import { useMutation } from 'react-query';
import { Jobs } from '@tapis/tapis-typescript';
import { submit } from 'tapis-api/jobs';
import { useTapisConfig } from 'tapis-hooks';

type SubmitHookParams = {
  request: Jobs.ReqSubmitJob,
  onSuccess?: (data: Jobs.RespSubmitJob) => any,
  onError?: (error: any) => any
}

const useSubmit = () => {
  const { basePath, accessToken } = useTapisConfig();
  const jwt = accessToken?.access_token || '';

  // The useMutation react-query hook is used to call operations that make server-side changes
  // (Other hooks would be used for data retrieval)
  //
  // In this case, loginHelper is called to perform the operation, with an onSuccess callback
  // passed as an option
  const { mutate, isLoading, isError, isSuccess, data, error, reset } = useMutation(submit);

  // Return hook object with loading states and login function
  return {
    isLoading,
    isError,
    isSuccess,
    data,
    error,
    reset,
    submit: (params: SubmitHookParams) => {
      const { request, onSuccess, onError } = params;

      // Call mutate to trigger a single post-like API operation
      return mutate(
        { request, basePath, jwt },
        { 
          onSuccess,
          onError
        }
      )
    }
  }
}

export default useSubmit;