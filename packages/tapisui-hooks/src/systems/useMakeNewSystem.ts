import { useMutation, MutateOptions } from 'react-query';
import { Systems } from '@tapis/tapis-typescript';
import { Systems as API } from '@tapis/tapisui-api';
import { useTapisConfig } from '../context';
import QueryKeys from './queryKeys';

type MkNewSystemHookParams = {
  reqPostSystem: Systems.ReqPostSystem;
  skipCredentialCheck: boolean;
};

const useMakeNewSystem = () => {
  const { basePath, accessToken } = useTapisConfig();
  const jwt = accessToken?.access_token || '';

  // The useMutation react-query hook is used to call operations that make server-side changes
  // (Other hooks would be used for data retrieval)
  //
  // In this case, mkdir helper is called to perform the operation
  const { mutate, isLoading, isError, isSuccess, data, error, reset } =
    useMutation<Systems.RespBasic, Error, MkNewSystemHookParams>(
      [QueryKeys.makeNewSystem, basePath, jwt],
      ({ reqPostSystem, skipCredentialCheck }) =>
        API.makeNewSystem({ reqPostSystem, skipCredentialCheck }, basePath, jwt)
    );

  // Return hook object with loading states and login function
  return {
    isLoading,
    isError,
    isSuccess,
    data,
    error,
    reset,
    makeNewSystem: (
      reqPostSystem: Systems.ReqPostSystem,
      skipCredentialCheck: boolean = true,
      // react-query options to allow callbacks such as onSuccess
      options?: MutateOptions<Systems.RespBasic, Error, MkNewSystemHookParams>
    ) => {
      // Call mutate to trigger a single post-like API operation
      return mutate({ reqPostSystem, skipCredentialCheck }, options);
    },
  };
};

export default useMakeNewSystem;
