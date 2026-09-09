import { useMutation, MutateOptions, useQueryClient } from 'react-query';
import { Jobs } from '@tapis/tapis-typescript';
import { Jobs as API } from '@tapis/tapisui-api';
import { useTapisConfig } from '../context';
import QueryKeys from './queryKeys';

const useShareJob = () => {
  const { basePath, accessToken } = useTapisConfig();
  const jwt = accessToken?.access_token || '';
  const queryClient = useQueryClient();
  const { mutate, isLoading, isError, isSuccess, data, error, reset } =
    useMutation<Jobs.RespShareJob, Error, Jobs.ShareJobRequest>(
      [QueryKeys.shareJob, basePath, jwt],
      (params) => API.shareJob(params, basePath, jwt),
      { onSuccess: () => queryClient.invalidateQueries(QueryKeys.share) }
    );
  return {
    isLoading,
    isError,
    isSuccess,
    data,
    error,
    reset,
    share: (
      params: Jobs.ShareJobRequest,
      options?: MutateOptions<Jobs.RespShareJob, Error, Jobs.ShareJobRequest>
    ) => mutate(params, options),
  };
};

export default useShareJob;
