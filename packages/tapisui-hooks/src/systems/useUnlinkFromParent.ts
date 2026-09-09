import { useMutation, MutateOptions, useQueryClient } from 'react-query';
import { Systems } from '@tapis/tapis-typescript';
import { Systems as API } from '@tapis/tapisui-api';
import { useTapisConfig } from '../';
import QueryKeys from './queryKeys';

const useUnlinkFromParent = () => {
  const { basePath, accessToken } = useTapisConfig();
  const jwt = accessToken?.access_token || '';
  const queryClient = useQueryClient();

  const { mutate, isLoading, isError, isSuccess, data, error, reset } =
    useMutation<
      Systems.RespChangeCount,
      Error,
      Systems.UnlinkFromParentRequest
    >([QueryKeys.unlinkFromParent, basePath, jwt], (params) =>
      API.unlinkFromParent(params, basePath, jwt)
    );

  const invalidate = () => {
    // parentId lives on the record — every reader of it
    queryClient.invalidateQueries(QueryKeys.details);
    queryClient.invalidateQueries(QueryKeys.list);
    queryClient.invalidateQueries(QueryKeys.listWindow);
  };

  return {
    isLoading,
    isError,
    isSuccess,
    data,
    error,
    reset,
    invalidate,
    unlink: (
      params: Systems.UnlinkFromParentRequest,
      // react-query options to allow callbacks such as onSuccess
      options?: MutateOptions<
        Systems.RespChangeCount,
        Error,
        Systems.UnlinkFromParentRequest
      >
    ) => {
      return mutate(params, options);
    },
  };
};

export default useUnlinkFromParent;
