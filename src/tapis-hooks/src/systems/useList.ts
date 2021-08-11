import { useQuery } from 'react-query';
import { list } from 'tapis-api/systems';
import { Systems } from '@tapis/tapis-typescript'
import { useTapisConfig } from 'tapis-hooks';

const useList = (params: Systems.GetSystemsRequest) => {
  const { accessToken, basePath } = useTapisConfig();
  const result = useQuery<Systems.RespSystems, Error>(
    [params, accessToken],
    () => list(params, basePath, accessToken.access_token),
    {
      enabled: !!accessToken
    }
  );
  return result;
}

export default useList;