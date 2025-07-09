import { useMutation, MutateOptions } from 'react-query';
import { Apps } from '@tapis/tapis-typescript';
import { Apps as API } from '@tapis/tapisui-api';
import { useTapisConfig } from '../';
import QueryKeys from './queryKeys';
import { useQueryClient } from 'react-query';

type PatchAppHookParams = Apps.PatchAppRequest;

const usePatch = () => {
  const { basePath, accessToken } = useTapisConfig();
  const jwt = accessToken?.access_token || '';
  const queryClient = useQueryClient();

  const { mutate, isLoading, isError, isSuccess, data, error, reset } =
    useMutation<Apps.RespResourceUrl, Error, PatchAppHookParams>(
      [QueryKeys.patch, basePath, jwt],
      (params) => API.patch(params, basePath, jwt)
    );

  const invalidate = () => {
    // TODO Uncomment when details added: queryClient.invalidateQueries(QueryKeys.details);
  };

  // Return hook object with loading states and login function
  return {
    isLoading,
    isError,
    isSuccess,
    data,
    error,
    reset,
    invalidate,
    patch: (
      params: PatchAppHookParams,
      // react-query options to allow callbacks such as onSuccess
      options?: MutateOptions<Apps.RespResourceUrl, Error, PatchAppHookParams>
    ) => {
      // Call mutate to trigger a single post-like API operation
      return mutate(params, options);
    },
  };
};

export default usePatch;
