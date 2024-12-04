import { useQuery, QueryObserverOptions } from 'react-query';
import { Pods as API } from '@tapis/tapisui-api';
import { Pods } from '@tapis/tapis-typescript';
import { useTapisConfig } from '..';
import QueryKeys from './queryKeys';

const useListTemplatesAndTags = (
  params: Pods.ListTemplatesAndTagsRequest,
  options: QueryObserverOptions<any, Error> = {}
) => {
  const { accessToken, basePath } = useTapisConfig();
  const result = useQuery<any, Error>(
    [QueryKeys.listTemplatesAndTags, accessToken],
    // Default to no token. This will generate a 403 when calling the list function
    // which is expected behavior for not having a token
    () =>
      API.listTemplatesAndTags(
        params,
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

export default useListTemplatesAndTags;
