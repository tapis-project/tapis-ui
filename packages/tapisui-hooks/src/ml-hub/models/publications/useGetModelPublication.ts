import { useQuery, QueryObserverOptions } from 'react-query';
import { MLHub as API } from '@tapis/tapisui-api';
import { useTapisConfig } from '../../..';
import { Models } from '@mlhub/ts-sdk';

const useGetModelPublication = (
  publicationId: string,
  options: QueryObserverOptions<Models.GetModelPublicationResponse, Error> = {}
) => {
  const { accessToken, mlHubBasePath } = useTapisConfig();

  return useQuery<Models.GetModelPublicationResponse, Error>(
    ['mlhub-publications-get', publicationId, accessToken?.access_token],
    () =>
      API.Models.Publications.getModelPublication(
        publicationId,
        mlHubBasePath + '/mlhub',
        accessToken?.access_token || ''
      ),
    {
      enabled: !!accessToken?.access_token && !!publicationId,
      ...options,
    }
  );
};

export default useGetModelPublication;
