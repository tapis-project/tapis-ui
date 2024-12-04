import { useQuery, QueryObserverOptions } from 'react-query';
import { Systems } from '@tapis/tapis-typescript';
import { Systems as API } from '@tapis/tapisui-api';
import { useTapisConfig } from '../';
import QueryKeys from './queryKeys';

const useGetGlobusAuthUrl = (
  params: Systems.GetGlobusAuthUrlRequest,
  options: QueryObserverOptions<Systems.RespGlobusAuthUrl, Error> = {}
) => {
  const { accessToken, basePath } = useTapisConfig();
  const result = useQuery<Systems.RespGlobusAuthUrl, Error>(
    [QueryKeys.getGlobusAuthUrl, params, accessToken],
    () =>
      API.getGlobusAuthUrl(params, basePath, accessToken?.access_token || ''),
    {
      ...options,
      enabled: !!accessToken,
    }
  );
  return result;
};

export default useGetGlobusAuthUrl;
