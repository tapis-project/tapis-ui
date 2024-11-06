import { useMutation, MutateOptions, useQueryClient } from 'react-query';
import { Systems } from '@tapis/tapis-typescript';
import { Systems as API } from '@tapis/tapisui-api';
import { useTapisConfig } from '../';
import QueryKeys from './queryKeys';

type GenerateGlobusTokensHookParams = {
  systemId: string;
  sessionId: string;
  authCode: string;
};

const useGenerateGlobusTokens = () => {
  const { basePath, accessToken, claims } = useTapisConfig();
  const jwt = accessToken?.access_token || '';
  const queryClient = useQueryClient();

  // The useMutation react-query hook is used to call operations that make server-side changes
  // (Other hooks would be used for data retrieval)
  //
  // In this case, mkdir helper is called to perform the operation
  const { mutate, isLoading, isError, isSuccess, data, error, reset } =
    useMutation<Systems.RespBasic, Error, GenerateGlobusTokensHookParams>(
      [QueryKeys.generateGlobusTokens, basePath, jwt],
      (params) =>
        API.generateGlobusTokens(
          {
            ...params,
            userName: claims['tapis/username'],
          },
          basePath,
          jwt
        )
    );

  const invalidate = () => {
    queryClient.invalidateQueries(QueryKeys.list);
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
    generate: (
      params: Omit<Systems.GenerateGlobusTokensRequest, 'userName'>,
      // react-query options to allow callbacks such as onSuccess
      options?: MutateOptions<
        Systems.RespBasic,
        Error,
        GenerateGlobusTokensHookParams
      >
    ) => {
      // Call mutate to trigger a single post-like API operation
      return mutate(params, options);
    },
  };
};

export default useGenerateGlobusTokens;
