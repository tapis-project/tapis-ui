import { useQuery } from 'react-query';
import { detail } from 'tapis-api/apps';
import { Apps } from '@tapis/tapis-typescript';
import { useTapisConfig } from 'tapis-hooks';
import QueryKeys from './queryKeys';

export const defaultParams: Apps.GetAppsRequest = {
  select: 'jobAttributes,version',
};

const useDetail = (params: Apps.GetAppRequest) => {
  const { accessToken, basePath } = useTapisConfig();
  const result = useQuery<Apps.RespApp, Error>(
    [QueryKeys.list, params, accessToken],
    // Default to no token. This will generate a 403 when calling the list function
    // which is expected behavior for not having a token
    () => detail({ ...params }, basePath, accessToken?.access_token ?? ''),
    {
      enabled: !!accessToken,
    }
  );
  return result;
};

export default useDetail;
