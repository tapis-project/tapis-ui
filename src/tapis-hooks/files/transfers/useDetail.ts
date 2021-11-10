import { useQuery } from 'react-query';
import { detail } from 'tapis-api/files/transfers';
import { Files } from '@tapis/tapis-typescript';
import { useTapisConfig } from 'tapis-hooks';
import QueryKeys from './queryKeys';

const useDetail = (transferTaskId: string) => {
  const { accessToken, basePath } = useTapisConfig();
  const result = useQuery<Files.TransferTaskResponse, Error>(
    [QueryKeys.detail, transferTaskId, accessToken],
    // Default to no token. This will generate a 403 when calling the list function
    // which is expected behavior for not having a token
    () => detail(transferTaskId, basePath, accessToken?.access_token ?? ''),
    {
      enabled: !!accessToken,
    }
  );
  return result;
};

export default useDetail;
