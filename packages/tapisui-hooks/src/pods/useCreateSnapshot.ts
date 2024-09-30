import { useMutation, MutateOptions } from 'react-query';
import { Pods } from '@tapis/tapis-typescript';
import { Pods as API } from '@tapis/tapisui-api';
import { useTapisConfig } from '../context';
import QueryKeys from './queryKeys';

type CreateSnapshotHookParams = Pods.CreateSnapshotRequest;

const useCreateSnapshot = () => {
  const { basePath, accessToken } = useTapisConfig();
  const jwt = accessToken?.access_token || '';

  // The useMutation react-query hook is used to call operations that make server-side changes
  // (Other hooks would be used for data retrieval)
  //
  // In this case, mkdir helper is called to perform the operation
  const { mutate, isLoading, isError, isSuccess, data, error, reset } =
    useMutation<Pods.SnapshotResponse, Error, CreateSnapshotHookParams>(
      [QueryKeys.createSnapshot, basePath, jwt],
      (params) => API.createSnapshot(params, basePath, jwt)
    );

  // Return hook object with loading states and login function
  return {
    isLoading,
    isError,
    isSuccess,
    data,
    error,
    reset,
    createSnapshot: (
      params: CreateSnapshotHookParams,
      // MutateOptions is a type that allows us to specify things like onSuccess
      options?: MutateOptions<
        Pods.SnapshotResponse,
        Error,
        CreateSnapshotHookParams
      >
    ) => mutate(params, options),
  };
};

export default useCreateSnapshot;
