import { useQuery } from 'react-query';
import { details } from 'tapis-api/files/transfers';
import { Files } from '@tapis/tapis-typescript';
import { useTapisConfig } from 'tapis-hooks';
import QueryKeys from './queryKeys';

const useDetails = (transferTaskId: string) => {
  const { accessToken, basePath } = useTapisConfig();
  const result = useQuery<Files.TransferTaskResponse, Error>(
    [QueryKeys.detail, transferTaskId, accessToken],
    // Default to no token. This will generate a 403 when calling the list function
    // which is expected behavior for not having a token
    () => details(transferTaskId, basePath, accessToken?.access_token ?? ''),
    {
      enabled: !!accessToken,
    }
  );
  return result;
};

export default useDetails;
