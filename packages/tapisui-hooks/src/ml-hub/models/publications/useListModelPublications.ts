import { useQuery, QueryObserverOptions } from 'react-query';
import { MLHub as API } from '@tapis/tapisui-api';
import { useTapisConfig } from '../../..';
import { Models } from '@mlhub/ts-sdk';

const useListModelPublications = (
  options: QueryObserverOptions<
    Models.ListModelPublicationsResponse,
    Error
  > = {}
) => {
  const { accessToken, mlHubBasePath } = useTapisConfig();

  return useQuery<Models.ListModelPublicationsResponse, Error>(
    ['mlhub-publications-list', accessToken?.access_token],
    () =>
      API.Models.Publications.listModelPublications(
        mlHubBasePath + '/mlhub',
        accessToken?.access_token || ''
      ),
    {
      enabled: !!accessToken?.access_token,
      ...options,
    }
  );
};

export default useListModelPublications;
