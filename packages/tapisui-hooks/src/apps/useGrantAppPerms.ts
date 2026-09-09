import { useMutation, MutateOptions, useQueryClient } from 'react-query';
import { Apps } from '@tapis/tapis-typescript';
import { Apps as API } from '@tapis/tapisui-api';
import { useTapisConfig } from '../context';
import QueryKeys from './queryKeys';
import { invalidateApp } from './appCache';

const useGrantAppPerms = () => {
  const { basePath, accessToken } = useTapisConfig();
  const jwt = accessToken?.access_token || '';
  const queryClient = useQueryClient();

  const { mutate, isLoading, isError, isSuccess, data, error, reset } =
    useMutation<Apps.RespBasic, Error, Apps.GrantUserPermsRequest>(
      [QueryKeys.grantUserPerms, basePath, jwt],
      (params) => API.grantUserPerms(params, basePath, jwt),
      {
        onSuccess: () => {
          // the per-user map is its own read and goes stale on any change
          queryClient.invalidateQueries(QueryKeys.userPermsMap);
          invalidateApp(queryClient);
        },
      }
    );

  return {
    isLoading,
    isError,
    isSuccess,
    data,
    error,
    reset,
    grant: (
      params: Apps.GrantUserPermsRequest,
      options?: MutateOptions<Apps.RespBasic, Error, Apps.GrantUserPermsRequest>
    ) => mutate(params, options),
  };
};

export default useGrantAppPerms;
