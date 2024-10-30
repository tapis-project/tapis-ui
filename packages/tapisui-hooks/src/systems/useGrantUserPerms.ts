import { useMutation, MutateOptions, useQueryClient } from 'react-query';
import { Systems } from '@tapis/tapis-typescript';
import { Systems as API } from '@tapis/tapisui-api';
import { useTapisConfig } from '../';
import QueryKeys from './queryKeys';

const useGrantUserPerms = () => {
  const { basePath, accessToken } = useTapisConfig();
  const jwt = accessToken?.access_token || '';
  const queryClient = useQueryClient();

  const { mutate, isLoading, isError, isSuccess, data, error, reset } =
    useMutation<Systems.RespBasic, Error, Systems.GrantUserPermsRequest>(
      [QueryKeys.createUserCredential, basePath, jwt],
      (params) => API.grantUserPerms(params, basePath, jwt)
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
    grant: (
      params: Systems.GrantUserPermsRequest,
      // react-query options to allow callbacks such as onSuccess
      options?: MutateOptions<
        Systems.RespBasic,
        Error,
        Systems.GrantUserPermsRequest
      >
    ) => {
      return mutate(params, options);
    },
  };
};

export default useGrantUserPerms;
