import { useQuery } from 'react-query';
import { stat } from 'tapis-api/files';
import { Files } from '@tapis/tapis-typescript';
import { useTapisConfig } from 'tapis-hooks';
import QueryKeys from './queryKeys';

const useStat = (params: Files.GetStatInfoRequest) => {
  const { accessToken, basePath } = useTapisConfig();
  const result = useQuery<Files.FileStatInfoResponse, Error>(
    [QueryKeys.stat, params, accessToken],
    // Default to no token. This will generate a 403 when calling the list function
    // which is expected behavior for not having a token
    () => stat(params, basePath, accessToken?.access_token ?? ''),
    {
      enabled: !!accessToken,
    }
  );
  return result;
};

export default useStat;
