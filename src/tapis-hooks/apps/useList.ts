import { useQuery } from 'react-query';
import { list } from 'tapis-api/apps';
import { Apps } from '@tapis/tapis-typescript'
import { useTapisConfig } from 'tapis-hooks';
import QueryKeys from './queryKeys';

const defaultParams: Apps.GetAppsRequest = {
  select: "jobAttributes,version"
}

const useList = (params: Apps.GetAppsRequest = defaultParams) => {
  const { accessToken, basePath } = useTapisConfig();
  const result = useQuery<Apps.RespApps, Error>(
    [QueryKeys.list, params, accessToken],
    // Default to no token. This will generate a 403 when calling the list function
    // which is expected behavior for not having a token
    () => list(params, basePath, accessToken?.access_token ?? ''),
    {
      enabled: !!accessToken
    }
  );
  return {
    result,
    ...defaultParams
  };
}

export default useList;