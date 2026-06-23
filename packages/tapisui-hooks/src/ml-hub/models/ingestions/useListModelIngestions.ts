import { useQuery, QueryObserverOptions } from 'react-query';
import { MLHub as API } from '@tapis/tapisui-api';
import { useTapisConfig } from '../../..';
import { Models } from '@mlhub/ts-sdk';

const useListModelIngestions = (
  options: QueryObserverOptions<Models.ListModelIngestionsResponse, Error> = {}
) => {
  const { accessToken, mlHubBasePath } = useTapisConfig();

  return useQuery<Models.ListModelIngestionsResponse, Error>(
    ['mlhub-ingestions-list', accessToken?.access_token],
    () =>
      API.Models.Ingestions.listModelIngestions(
        mlHubBasePath,
        accessToken?.access_token || ''
      ),
    {
      enabled: !!accessToken?.access_token,
      ...options,
    }
  );
};

export default useListModelIngestions;
