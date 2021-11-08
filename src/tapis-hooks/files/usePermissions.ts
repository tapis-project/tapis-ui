import { useQuery } from 'react-query';
import { permissions } from 'tapis-api/files';
import { Files } from '@tapis/tapis-typescript';
import { useTapisConfig } from 'tapis-hooks';
import QueryKeys from './queryKeys';

const usePermissions = (params: Files.GetPermissionsRequest) => {
  const { accessToken, basePath } = useTapisConfig();
  const result = useQuery<Files.FilePermissionResponse, Error>(
    [QueryKeys.permissions, params, accessToken],
    // Default to no token. This will generate a 403 when calling the list function
    // which is expected behavior for not having a token
    () => permissions(params, basePath, accessToken?.access_token ?? ''),
    {
      enabled: !!accessToken,
    }
  );
  return result;
};

export default usePermissions;
