import { useQuery, QueryObserverOptions } from 'react-query';
import { MLHub as API } from '@tapis/tapisui-api';
import { useTapisConfig } from '../../..';
import { Models } from '@mlhub/ts-sdk';

const useGetModelIngestion = (
  ingestionId: string,
  options: QueryObserverOptions<Models.GetModelIngestionResponse, Error> = {}
) => {
  const { accessToken, mlHubBasePath } = useTapisConfig();

  return useQuery<Models.GetModelIngestionResponse, Error>(
    ['mlhub-ingestions-get', ingestionId, accessToken?.access_token],
    () =>
      API.Models.Ingestions.getModelIngestion(
        ingestionId,
        mlHubBasePath,
        accessToken?.access_token || ''
      ),
    {
      enabled: !!accessToken?.access_token && !!ingestionId,
      refetchInterval: (data) => {
        const status = data?.result?.status;
        const isTerminal = status === 'Finished' || status === 'Failed';
        return isTerminal ? false : 3000;
      },
      ...options,
    }
  );
};

export default useGetModelIngestion;
