import { useMutation, MutateOptions } from 'react-query';
import { Systems } from '@tapis/tapis-typescript';
import { Systems as API } from '@tapis/tapisui-api';
import { useTapisConfig } from '../context';
import QueryKeys from './queryKeys';

type CreateSystemHookParams = {
  reqPostSystem: Systems.ReqPostSystem;
  skipCredentialCheck: boolean;
};

const useCreateSystem = () => {
  const { basePath, accessToken } = useTapisConfig();
  const jwt = accessToken?.access_token || '';
  const {
    mutate,
    mutateAsync,
    isLoading,
    isError,
    isSuccess,
    data,
    error,
    reset,
  } = useMutation<Systems.RespBasic, Error, CreateSystemHookParams>(
    [QueryKeys.createSystem, basePath, jwt],
    ({ reqPostSystem, skipCredentialCheck }) =>
      API.createSystem({ reqPostSystem, skipCredentialCheck }, basePath, jwt)
  );

  // Return hook object with loading states and login function
  return {
    isLoading,
    isError,
    isSuccess,
    data,
    error,
    reset,
    createSystem: (
      reqPostSystem: Systems.ReqPostSystem,
      skipCredentialCheck: boolean = true,
      options?: MutateOptions<Systems.RespBasic, Error, CreateSystemHookParams>
    ) => {
      return mutateAsync({ reqPostSystem, skipCredentialCheck }, options);
    },
  };
};

export default useCreateSystem;
