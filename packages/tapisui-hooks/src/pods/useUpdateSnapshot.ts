import { useEffect } from 'react';
import { useMutation, MutateOptions } from 'react-query';
import { Pods } from '@tapis/tapis-typescript';
import { Pods as API } from '@tapis/tapisui-api';
import { useTapisConfig } from '../context';
import QueryKeys from './queryKeys';

type UpdateSnapshotHookParams = Pods.UpdateSnapshotRequest;

const useUpdateSnapshot = (snapshotId: string) => {
  const { basePath, accessToken } = useTapisConfig();
  const jwt = accessToken?.access_token || '';

  // The useMutation react-query hook is used to call operations that make server-side changes
  // (Other hooks would be used for data retrieval)
  //
  // In this case, mkdir helper is called to perform the operation
  const { mutate, isLoading, isError, isSuccess, data, error, reset } =
    useMutation<Pods.SnapshotResponse, Error, Pods.UpdateSnapshotRequest>(
      [QueryKeys.updateSnapshot, snapshotId, basePath, jwt],
      (params) => API.updateSnapshot(params, basePath, jwt)
    );

  // Return hook object with loading states and login function
  return {
    isLoading,
    isError,
    isSuccess,
    data,
    error,
    reset,
    updateSnapshot: (
      params: UpdateSnapshotHookParams,
      // react-query options to allow callbacks such as onSuccess
      options?: MutateOptions<
        Pods.SnapshotResponse,
        Error,
        UpdateSnapshotHookParams
      >
    ) => {
      // Call mutate to trigger a single post-like API operation
      return mutate(params, options);
    },
  };
};

export default useUpdateSnapshot;
