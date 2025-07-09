import { useMutation, MutateOptions } from 'react-query';
import { Systems } from '@tapis/tapis-typescript';
import { Systems as API } from '@tapis/tapisui-api';
import { useTapisConfig } from '../';
import QueryKeys from './queryKeys';
import { useQueryClient } from 'react-query';

type PatchSystemHookParams = Systems.PatchSystemRequest;

const usePatch = () => {
  const { basePath, accessToken } = useTapisConfig();
  const jwt = accessToken?.access_token || '';
  const queryClient = useQueryClient();

  const { mutate, isLoading, isError, isSuccess, data, error, reset } =
    useMutation<Systems.RespResourceUrl, Error, PatchSystemHookParams>(
      [QueryKeys.patch, basePath, jwt],
      (params) => API.patch(params, basePath, jwt)
    );

  const invalidate = () => {
    queryClient.invalidateQueries(QueryKeys.details);
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
      params: PatchSystemHookParams,
      // react-query options to allow callbacks such as onSuccess
      options?: MutateOptions<
        Systems.RespResourceUrl,
        Error,
        PatchSystemHookParams
      >
    ) => {
      // Call mutate to trigger a single post-like API operation
      return mutate(params, options);
    },
  };
};

export default usePatch;
