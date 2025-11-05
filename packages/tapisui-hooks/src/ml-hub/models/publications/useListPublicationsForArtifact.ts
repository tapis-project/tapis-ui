import { useQuery, QueryObserverOptions } from 'react-query';
import { MLHub as API } from '@tapis/tapisui-api';
import { useTapisConfig } from '../../..';
import { Models } from '@mlhub/ts-sdk';

const useListPublicationsForArtifact = (
  artifactId: string,
  options: QueryObserverOptions<
    Models.ListModelPublicationsForArtifactResponse,
    Error
  > = {}
) => {
  const { accessToken, mlHubBasePath } = useTapisConfig();

  return useQuery<Models.ListModelPublicationsForArtifactResponse, Error>(
    ['mlhub-publications-for-artifact', artifactId, accessToken?.access_token],
    () =>
      API.Models.Publications.listPublicationsForArtifact(
        artifactId,
        mlHubBasePath + '/mlhub',
        accessToken?.access_token || ''
      ),
    {
      enabled: !!accessToken?.access_token && !!artifactId,
      ...options,
    }
  );
};

export default useListPublicationsForArtifact;
