import { useQuery, QueryObserverOptions, useQueryClient } from 'react-query';
import { Pods as API } from '@tapis/tapisui-api';
import { Pods } from '@tapis/tapis-typescript';
import { useTapisConfig } from '..';
import QueryKeys from './queryKeys';

const useListTemplates = (
  options: QueryObserverOptions<Pods.TemplatesResponse, Error> = {}
) => {
  const queryClient = useQueryClient(); // Get the queryClient instance
  const { accessToken, basePath } = useTapisConfig();
  const result = useQuery<Pods.TemplatesResponse, Error>(
    [QueryKeys.listTemplates, accessToken],
    // Default to no token. This will generate a 403 when calling the list function
    // which is expected behavior for not having a token
    () => API.listTemplates(basePath, accessToken?.access_token || ''),
    {
      ...options,
      enabled: !!accessToken,
    }
  );

  const invalidate = () => {
    queryClient.invalidateQueries([QueryKeys.listTemplates]);
  };

  return { ...result, invalidate };
};

export default useListTemplates;
