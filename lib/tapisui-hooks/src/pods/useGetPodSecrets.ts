import { useQuery, QueryObserverOptions } from 'react-query';
import { Pods as API } from '@tapis/tapisui-api';
import { Pods } from '@tapis/tapis-typescript';
import { useTapisConfig } from '../';
import QueryKeys from './queryKeys';

const useGetPodSecrets = (
  params: Pods.GetPodCredentialsRequest,
  options: QueryObserverOptions<Pods.PodCredentialsResponse, Error> = {}
) => {
  const { accessToken, basePath } = useTapisConfig();
  const result = useQuery<Pods.PodCredentialsResponse, Error>(
    [QueryKeys.getPodSecrets, params, accessToken],
    // Default to no token. This will generate a 403 when calling the list function
    // which is expected behavior for not having a token
    () => API.getPodSecrets(params, basePath, accessToken?.access_token ?? ''),
    {
      enabled: !!accessToken,
    }
  );
  return result;
};

export default useGetPodSecrets;

// type GetPodSecretsHookParams = {
//   podId: string;
// };

// const useGetPodSecrets = () => {
//   const { basePath, accessToken } = useTapisConfig();
//   const jwt = accessToken?.access_token || '';

//   // The useMutation react-query hook is used to call operations that make server-side changes
//   // (Other hooks would be used for data retrieval)
//   //
//   // In this case, mkdir helper is called to perform the operation
//   const { mutate, isLoading, isError, isSuccess, data, error, reset } =
//     useMutation<Pods.PodCredentialsResponse, Error, GetPodSecretsHookParams>(
//       [QueryKeys.getPodCredentials, basePath, jwt],
//       ({ podId }) => API.getPodCredentials(podId, basePath, jwt)
//     );

//   // Return hook object with loading states and login function
//   return {
//     isLoading,
//     isError,
//     isSuccess,
//     data,
//     error,
//     reset,
//     getPodSecrets: (
//       podId: string,
//       // react-query options to allow callbacks such as onSuccess
//       options?: MutateOptions<
//         Pods.PodCredentialsResponse,
//         Error,
//         GetPodSecretsHookParams
//       >
//     ) => {
//       // Call mutate to trigger a single post-like API operation
//       return mutate({ podId }, options);
//     },
//   };
// };

// export default useGetPodSecrets;
