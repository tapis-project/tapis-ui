import { useMutation, MutateOptions, useQueryClient } from 'react-query';
import { Systems } from '@tapis/tapis-typescript';
import { Systems as API } from '@tapis/tapisui-api';
import { useTapisConfig } from '../';
import QueryKeys from './queryKeys';

type RemoveUserCredentialHookParams = {
  systemId: string;
  userName?: string;
};

const useRemoveCredential = () => {
  const { basePath, accessToken, claims } = useTapisConfig();
  const jwt = accessToken?.access_token || '';
  const queryClient = useQueryClient();

  const { mutate, isLoading, isError, isSuccess, data, error, reset } =
    useMutation<Systems.RespBasic, Error, RemoveUserCredentialHookParams>(
      [QueryKeys.removeUserCredential, basePath, jwt],
      (params) =>
        API.removeUserCredential(
          {
            ...params,
            userName: params.userName
              ? params.userName
              : claims['tapis/username'],
          },
          basePath,
          jwt
        )
    );

  const invalidate = () => {
    queryClient.invalidateQueries([QueryKeys.list, QueryKeys.details]);
  };

  return {
    isLoading,
    isError,
    isSuccess,
    data,
    error,
    reset,
    invalidate,
    remove: (
      params: RemoveUserCredentialHookParams,
      options?: MutateOptions<
        Systems.RespBasic,
        Error,
        RemoveUserCredentialHookParams
      >
    ) => {
      return mutate(params, options);
    },
  };
};

export default useRemoveCredential;
