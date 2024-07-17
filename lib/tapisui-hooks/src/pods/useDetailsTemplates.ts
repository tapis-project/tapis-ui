import { useQuery, QueryObserverOptions } from 'react-query';
import { Pods as API } from '@tapis/tapisui-api';
import { Pods } from '@tapis/tapis-typescript';
import { useTapisConfig } from '..';
import QueryKeys from './queryKeys';

const useDetailsTemplates = (
  params: Pods.GetTemplateRequest,
  options: QueryObserverOptions<Pods.TemplateResponse, Error> = {}
) => {
  const { accessToken, basePath } = useTapisConfig();
  const result = useQuery<Pods.TemplateResponse, Error>(
    [QueryKeys.detailsTemplates, params, accessToken],
    // Default to no token. This will generate a 403 when calling the list function
    // which is expected behavior for not having a token
    () =>
      API.detailsTemplates(params, basePath, accessToken?.access_token ?? ''),
    {
      enabled: !!accessToken,
    }
  );
  return result;
};

export default useDetailsTemplates;
