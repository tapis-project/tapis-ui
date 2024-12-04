import { useQuery, QueryObserverOptions, useQueryClient } from 'react-query';
import { Pods as API } from '@tapis/tapisui-api';
import { Pods } from '@tapis/tapis-typescript';
import { useTapisConfig } from '..';
import QueryKeys from './queryKeys';

const useGetTemplate = (
  params: Pods.GetTemplateRequest,
  options: QueryObserverOptions<Pods.TemplateResponse, Error> = {}
) => {
  const queryClient = useQueryClient(); // Get the queryClient instance
  const { accessToken, basePath } = useTapisConfig();
  const result = useQuery<Pods.TemplateResponse, Error>(
    [QueryKeys.getTemplate, params, accessToken],
    // Default to no token. This will generate a 403 when calling the list function
    // which is expected behavior for not having a token
    () => API.getTemplate(params, basePath, accessToken?.access_token ?? ''),
    {
      enabled: !!accessToken,
      ...options,
    }
  );

  const invalidate = () => {
    queryClient.invalidateQueries([QueryKeys.getTemplate]);
  };

  return { ...result, invalidate };
};

export default useGetTemplate;
