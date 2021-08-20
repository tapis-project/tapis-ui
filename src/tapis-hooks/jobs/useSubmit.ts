import { useMutation } from 'react-query';
import { Jobs } from '@tapis/tapis-typescript';
import { submit } from 'tapis-api/jobs';
import { useTapisConfig } from 'tapis-hooks';
import QueryKeys from './queryKeys';

type SubmitHookParams = {
  request: Jobs.ReqSubmitJob,
  onSuccess?: (data: Jobs.RespSubmitJob) => any,
  onError?: (error: any) => any
}

const useSubmit = (appId: string, version: string) => {
  const { basePath, accessToken } = useTapisConfig();
  const jwt = accessToken?.access_token || '';

  // The useMutation react-query hook is used to call operations that make server-side changes
  // (Other hooks would be used for data retrieval)
  //
  // In this case, submit helper is called to perform the operation
  const { mutate, isLoading, isError, isSuccess, data, error, reset } = useMutation(
    [ QueryKeys.submit, appId, version, basePath, jwt ],
    (request: Jobs.ReqSubmitJob) => submit(request, basePath, jwt),
  );

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
        request,
        { 
          onSuccess,
          onError
        }
      )
    }
  }
}

export default useSubmit;