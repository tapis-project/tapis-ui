import { useQuery, QueryObserverOptions, useQueryClient } from 'react-query';
import { Pods as API } from '@tapis/tapisui-api';
import { Pods } from '@tapis/tapis-typescript';
import { useTapisConfig } from '..';
import QueryKeys from './queryKeys';

const useListTemplateTags = (
  params: Pods.ListTemplateTagsRequest,
  options: QueryObserverOptions<any, Error> = {}
) => {
  const queryClient = useQueryClient();
  const { accessToken, basePath } = useTapisConfig();
  const result = useQuery<any, Error>(
    [QueryKeys.listTemplateTags, params, accessToken],
    // Default to no token. This will generate a 403 when calling the list function
    // which is expected behavior for not having a token
    () =>
      API.listTemplateTags(params, basePath, accessToken?.access_token ?? ''),
    {
      enabled: !!accessToken,
      ...options,
    }
  );

  const invalidate = () => {
    queryClient.invalidateQueries([QueryKeys.listTemplateTags]);
  };

  return { ...result, invalidate };
};

export default useListTemplateTags;
