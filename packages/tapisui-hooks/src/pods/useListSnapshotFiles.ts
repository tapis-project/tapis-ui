import { useQuery, QueryObserverOptions, useQueryClient } from 'react-query';
import { Pods as API } from '@tapis/tapisui-api';
import { Pods } from '@tapis/tapis-typescript';
import { useTapisConfig } from '..';
import QueryKeys from './queryKeys';

const listSnapshotFiles = (
  params: Pods.ListSnapshotFilesRequest,
  options: QueryObserverOptions<Pods.FilesListResponse, Error> = {}
) => {
  const queryClient = useQueryClient();
  const { accessToken, basePath } = useTapisConfig();
  const result = useQuery<Pods.FilesListResponse, Error>(
    [QueryKeys.listSnapshotFiles, params, accessToken],
    // Default to no token. This will generate a 403 when calling the list function
    // which is expected behavior for not having a token
    () =>
      API.listSnapshotFiles(params, basePath, accessToken?.access_token ?? ''),
    {
      enabled: !!accessToken,
      ...options,
    }
  );

  const invalidate = () => {
    queryClient.invalidateQueries([QueryKeys.listSnapshotFiles]);
  };

  return { ...result, invalidate };
};

export default listSnapshotFiles;
