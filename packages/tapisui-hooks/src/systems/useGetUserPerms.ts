import { useQuery, QueryObserverOptions } from 'react-query';
import { Systems as API } from '@tapis/tapisui-api';
import { Systems } from '@tapis/tapis-typescript';
import { useTapisConfig } from '../';
import QueryKeys from './queryKeys';

const useGetUserPerms = (
  params: Omit<Systems.GetUserPermsRequest, 'userName'>,
  options: QueryObserverOptions<Systems.RespNameArray, Error> = {}
) => {
  const { accessToken, basePath, username } = useTapisConfig();
  const result = useQuery<Systems.RespNameArray, Error>(
    [QueryKeys.getUserPerms, params, accessToken],
    // Default to no token. This will generate a 403 when calling the list function
    // which is expected behavior for not having a token
    () =>
      API.getUserPerms(
        {
          ...params,
          userName: username,
        },
        basePath,
        accessToken?.access_token || ''
      ),
    {
      ...options,
      enabled: !!accessToken,
    }
  );
  return result;
};

export default useGetUserPerms;
