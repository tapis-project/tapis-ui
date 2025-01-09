import { useMutation, MutateOptions, useQueryClient } from 'react-query';
import { Systems } from '@tapis/tapis-typescript';
import { Systems as API } from '@tapis/tapisui-api';
import { useTapisConfig } from '../';
import QueryKeys from './queryKeys';

const useChangeOwner = () => {
  const { basePath, accessToken } = useTapisConfig();
  const jwt = accessToken?.access_token || '';
  const queryClient = useQueryClient();

  const { mutate, isLoading, isError, isSuccess, data, error, reset } =
    useMutation<
      Systems.RespChangeCount,
      Error,
      Systems.ChangeSystemOwnerRequest
    >([QueryKeys.changeOwner, basePath, jwt], (params) =>
      API.changeOwner(params, basePath, jwt)
    );

  const invalidate = () => {
    queryClient.invalidateQueries([QueryKeys.details]);
  };

  // Return hook object with loading states and login function
  return {
    isLoading,
    isError,
    isSuccess,
    data,
    error,
    reset,
    invalidate,
    change: (
      params: Systems.ChangeSystemOwnerRequest,
      // react-query options to allow callbacks such as onSuccess
      options?: MutateOptions<
        Systems.RespChangeCount,
        Error,
        Systems.ChangeSystemOwnerRequest
      >
    ) => {
      return mutate(params, options);
    },
  };
};

export default useChangeOwner;
