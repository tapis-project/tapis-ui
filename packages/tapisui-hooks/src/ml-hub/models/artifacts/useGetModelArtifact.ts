import { useQuery, QueryObserverOptions } from 'react-query';
import { MLHub as API } from '@tapis/tapisui-api';
import { useTapisConfig } from '../../..';
import { Models } from '@mlhub/ts-sdk';

const useGetModelArtifact = (
  artifactId: string,
  options: QueryObserverOptions<Models.GetModelArtifactResponse, Error> = {}
) => {
  const { accessToken, mlHubBasePath } = useTapisConfig();

  return useQuery<Models.GetModelArtifactResponse, Error>(
    ['mlhub-artifacts-get', artifactId, accessToken?.access_token],
    () =>
      API.Models.Artifacts.getModelArtifact(
        artifactId,
        mlHubBasePath,
        accessToken?.access_token || ''
      ),
    {
      enabled: !!accessToken?.access_token && !!artifactId,
      ...options,
    }
  );
};

export default useGetModelArtifact;
