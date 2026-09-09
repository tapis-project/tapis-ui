import { useQuery, QueryObserverOptions } from 'react-query';
import { Jobs as API } from '@tapis/tapisui-api';
import { Jobs } from '@tapis/tapis-typescript';
import { useTapisConfig } from '../';
import QueryKeys from './queryKeys';
import { noBackgroundRefetch } from '../utils/cachePolicy';

/**
 * One of a job's output files, as text.
 *
 * Deliberately no refetch defaults beyond the usual off switches: the callers
 * that want this are watching a file that is still being written, so they own
 * the schedule (see the FlexServ card, which backs off and gives up).
 */
const useGetJobOutputText = (
  params: Jobs.GetJobOutputDownloadRequest,
  options: QueryObserverOptions<string, Error> = {}
) => {
  const { accessToken, basePath } = useTapisConfig();
  return useQuery<string, Error>(
    [QueryKeys.outputText, params, accessToken],
    () =>
      API.getJobOutputText(params, basePath, accessToken?.access_token ?? ''),
    {
      ...noBackgroundRefetch,
      refetchOnMount: false,
      ...options,
      enabled: (options.enabled ?? true) && !!accessToken,
    }
  );
};

export default useGetJobOutputText;
