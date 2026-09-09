import { useMutation, MutateOptions, useQueryClient } from 'react-query';
import { Jobs } from '@tapis/tapis-typescript';
import { Jobs as API } from '@tapis/tapisui-api';
import { useTapisConfig } from '../context';
import QueryKeys from './queryKeys';

const useDeleteJobShare = () => {
  const { basePath, accessToken } = useTapisConfig();
  const jwt = accessToken?.access_token || '';
  const queryClient = useQueryClient();
  const { mutate, isLoading, isError, isSuccess, data, error, reset } =
    useMutation<Jobs.RespUnShareJob, Error, Jobs.DeleteJobShareRequest>(
      [QueryKeys.deleteJobShare, basePath, jwt],
      (params) => API.deleteJobShare(params, basePath, jwt),
      { onSuccess: () => queryClient.invalidateQueries(QueryKeys.share) }
    );
  return {
    isLoading,
    isError,
    isSuccess,
    data,
    error,
    reset,
    unshare: (
      params: Jobs.DeleteJobShareRequest,
      options?: MutateOptions<
        Jobs.RespUnShareJob,
        Error,
        Jobs.DeleteJobShareRequest
      >
    ) => mutate(params, options),
  };
};

export default useDeleteJobShare;
