import { useQuery, QueryObserverOptions } from 'react-query';
import { MLHub as API } from '@tapis/tapisui-api';
import { Models } from '@tapis/tapis-typescript';
import { useTapisConfig } from '../../';
import QueryKeys from './queryKeys';

const useListDownloadLinks = (
  params: Models.DownloadModelRequest,
  options: QueryObserverOptions<Models.RespModelDownload, Error> = {}
) => {
  const { accessToken, basePath } = useTapisConfig();
  const result = useQuery<Models.RespModelDownload, Error>(
    [QueryKeys.listDownloadLinks, params, accessToken],
    // Default to no token. This will generate a 403 when calling the list function
    // which is expected behavior for not having a token
    () =>
      API.Models.listDownloadLinks(
        params,
        basePath,
        accessToken?.access_token ?? ''
      ),
    {
      enabled: !!accessToken,
    }
  );
  return result;
};

export default useListDownloadLinks;
