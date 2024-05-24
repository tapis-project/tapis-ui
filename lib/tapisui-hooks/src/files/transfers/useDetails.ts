import { useQuery } from 'react-query';
import { Files as API } from '@tapis/tapisui-api';
import { Files } from '@tapis/tapis-typescript';
import { useTapisConfig } from '../../';
import QueryKeys from './queryKeys';

const useDetails = (transferTaskId: string) => {
  const { accessToken, basePath } = useTapisConfig();
  const result = useQuery<Files.TransferTaskResponse, Error>(
    [QueryKeys.detail, transferTaskId, accessToken],
    // Default to no token. This will generate a 403 when calling the list function
    // which is expected behavior for not having a token
    () =>
      API.Transfers.details(
        transferTaskId,
        basePath,
        accessToken?.access_token ?? ''
      ),
    {
      enabled: !!accessToken,
    }
  );
  return result;
};

export default useDetails;
