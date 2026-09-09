import { useMutation, MutateOptions, useQueryClient } from 'react-query';
import { Jobs } from '@tapis/tapis-typescript';
import { Jobs as API } from '@tapis/tapisui-api';
import { useTapisConfig } from '../context';
import QueryKeys from './queryKeys';

type UnhideJobHookParams = {
  jobUuid: string;
};

const useUnhideJob = () => {
  const { basePath, accessToken } = useTapisConfig();
  const queryClient = useQueryClient();
  const jwt = accessToken?.access_token || '';

  // The useMutation react-query hook is used to call operations that make server-side changes
  // (Other hooks would be used for data retrieval)
  //
  // In this case, mkdir helper is called to perform the operation
  const { mutate, isLoading, isError, isSuccess, data, error, reset } =
    useMutation<Jobs.RespHideJob, Error, UnhideJobHookParams>(
      [QueryKeys.unhideJob, basePath, jwt],
      ({ jobUuid }) => API.unhideJob(jobUuid, basePath, jwt),
      {
        onSuccess: () => {
          // the other direction of the same listing act — the run has to
          // come BACK into the nav and the dashboard on its own
          queryClient.invalidateQueries(QueryKeys.list);
          queryClient.invalidateQueries(QueryKeys.listWindow);
          queryClient.invalidateQueries(QueryKeys.details);
        },
      }
    );

  // Return hook object with loading states and login function
  return {
    isLoading,
    isError,
    isSuccess,
    data,
    error,
    reset,
    unhideJob: (
      jobUuid: string,
      // react-query options to allow callbacks such as onSuccess
      options?: MutateOptions<Jobs.RespHideJob, Error, UnhideJobHookParams>
    ) => {
      // Call mutate to trigger a single post-like API operation
      return mutate({ jobUuid }, options);
    },
  };
};

export default useUnhideJob;
