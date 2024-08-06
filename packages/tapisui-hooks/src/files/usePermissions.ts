import { useQuery } from 'react-query';
import { Files as API } from '@tapis/tapisui-api';
import { Files } from '@tapis/tapis-typescript';
import { useTapisConfig } from '../';
import QueryKeys from './queryKeys';

const usePermissions = (params: Files.GetPermissionsRequest) => {
  const { accessToken, basePath } = useTapisConfig();
  const result = useQuery<Files.FilePermissionResponse, Error>(
    [QueryKeys.permissions, params, accessToken],
    // Default to no token. This will generate a 403 when calling the list function
    // which is expected behavior for not having a token
    () => API.permissions(params, basePath, accessToken?.access_token ?? ''),
    {
      enabled: !!accessToken,
    }
  );
  return result;
};

export default usePermissions;
