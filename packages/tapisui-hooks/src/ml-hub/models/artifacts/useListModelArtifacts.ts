import { useQuery, QueryObserverOptions } from 'react-query';
import { MLHub as API } from '@tapis/tapisui-api';
import { useTapisConfig } from '../../..';
import { Models } from '@mlhub/ts-sdk';

const useListModelArtifacts = (
  options: QueryObserverOptions<Models.ListModelArtifactResponse, Error> = {}
) => {
  const { accessToken, mlHubBasePath } = useTapisConfig();

  return useQuery<Models.ListModelArtifactResponse, Error>(
    ['mlhub-artifacts-list', accessToken?.access_token],
    () =>
      API.Models.Artifacts.listModelArtifacts(
        mlHubBasePath,
        accessToken?.access_token || ''
      ),
    {
      enabled: !!accessToken?.access_token,
      ...options,
    }
  );
};

export default useListModelArtifacts;
