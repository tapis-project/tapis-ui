import { useMutation, MutateOptions } from 'react-query';
import { Jobs } from '@tapis/tapis-typescript';
import { hideJob } from '../../tapis-api/jobs';
import { useTapisConfig } from '../context';
import QueryKeys from './queryKeys';

type HideJobHookParams = {
  jobUuid: string;
};

const useHideJob = () => {
  const { basePath, accessToken } = useTapisConfig();
  const jwt = accessToken?.access_token || '';

  // The useMutation react-query hook is used to call operations that make server-side changes
  // (Other hooks would be used for data retrieval)
  //
  // In this case, mkdir helper is called to perform the operation
  const { mutate, isLoading, isError, isSuccess, data, error, reset } =
    useMutation<Jobs.RespHideJob, Error, HideJobHookParams>(
      [QueryKeys.hideJob, basePath, jwt],
      ({ jobUuid }) => hideJob(jobUuid, basePath, jwt)
    );

  // Return hook object with loading states and login function
  return {
    isLoading,
    isError,
    isSuccess,
    data,
    error,
    reset,
    hideJob: (
      jobUuid: string,
      // react-query options to allow callbacks such as onSuccess
      options?: MutateOptions<Jobs.RespHideJob, Error, HideJobHookParams>
    ) => {
      // Call mutate to trigger a single post-like API operation
      return mutate({ jobUuid }, options);
    },
  };
};

export default useHideJob;
