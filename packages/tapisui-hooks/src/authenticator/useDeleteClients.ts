import {
  useQuery,
  QueryObserverOptions,
  useQueryClient,
  useMutation,
  MutateOptions,
} from 'react-query';
import { Authenticator as API } from '@tapis/tapisui-api';
import { Authenticator } from '@tapis/tapis-typescript';
import { useTapisConfig } from '../context';
import QueryKeys from './queryKeys';
import { deleteClients } from '@tapis/tapisui-api/dist/authenticator';

type DeleteClientParams = {
  clientId: string;
};

const useDeleteClients = (params: Authenticator.DeleteClientRequest) => {
  const { accessToken, basePath } = useTapisConfig();
  //   const result = useQuery<Authenticator.RespDeleteClient, Error, DeleteClientParams>(
  //     [QueryKeys.deleteClients, accessToken, params],
  //     ({clientId}) => API.deleteClients(params, basePath, accessToken?.access_token!, clientId)
  //   );

  //   return result;
  // };

  const jwt = accessToken?.access_token || '';
  const queryClient = useQueryClient();

  // The useMutation react-query hook is used to call operations that make server-side changes
  // (Other hooks would be used for data retrieval)
  //
  // In this case, mkdir helper is called to perform the operation
  const { mutate, isLoading, isError, isSuccess, data, error, reset } =
    useMutation<Authenticator.RespDeleteClient, Error, DeleteClientParams>(
      [QueryKeys.deleteClients, basePath, jwt],
      ({ clientId }) => API.deleteClients(params, basePath, jwt)
    );

  const invalidate = () => {
    queryClient.invalidateQueries([QueryKeys.deleteClients]);
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
    deleteClients: (
      clientId: string,
      // react-query options to allow callbacks such as onSuccess
      options?: MutateOptions<
        Authenticator.RespDeleteClient,
        Error,
        DeleteClientParams
      >
    ) => {
      // Call mutate to trigger a single post-like API operation
      return mutate({ clientId }, options);
    },
  };
};

export default useDeleteClients;
