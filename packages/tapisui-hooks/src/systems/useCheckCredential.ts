import { useQuery, QueryObserverOptions } from 'react-query';
import { Systems } from '@tapis/tapis-typescript';
import { Systems as API } from '@tapis/tapisui-api';
import { useTapisConfig } from '..';
import QueryKeys from './queryKeys';

const useCheckCredential = (
  params: Omit<Systems.CheckUserCredentialRequest, 'userName'>,
  options: QueryObserverOptions<Systems.RespBasic, Error> = {
    retry: 0,
  }
) => {
  const { accessToken, basePath, claims } = useTapisConfig();
  const result = useQuery<Systems.RespBasic, Error>(
    [QueryKeys.checkUserCredential, params, accessToken],
    () =>
      API.checkUserCredential(
        {
          ...params,
          userName: claims['tapis/username'],
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

export default useCheckCredential;
