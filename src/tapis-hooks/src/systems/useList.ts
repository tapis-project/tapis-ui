import { useQuery } from 'react-query';
import { list } from 'tapis-api/src/systems';
import { Systems } from '@tapis/tapis-typescript'
import { useTapisConfig } from 'tapis-hooks/src';

const useList = (params: Systems.GetSystemsRequest) => {
  const { accessToken, basePath } = useTapisConfig();
  const result = useQuery<Systems.RespSystems, Error>(
    [params, accessToken],
    // Default to no token. This will generate a 403 when calling the list function
    // which is expected behavior for not having a token
    () => list(params, basePath, accessToken?.access_token || ''),
    {
      enabled: !!accessToken
    }
  );
  return result;
}

export default useList;