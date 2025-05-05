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

type DeleteClientParams = {
  clientId: string;
};

const useDeleteClients = () => {
  const { accessToken, basePath } = useTapisConfig();
  const jwt = accessToken?.access_token || '';
  const queryClient = useQueryClient();

  const { mutate, isLoading, isError, isSuccess, data, error, reset } =
    useMutation<Authenticator.RespDeleteClient, Error, DeleteClientParams>(
      ({ clientId }) => API.deleteClients(clientId, basePath, jwt)
    );

  const invalidate = () => {
    queryClient.invalidateQueries([QueryKeys.listClients]);
  };

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
      options?: MutateOptions<
        Authenticator.RespDeleteClient,
        Error,
        DeleteClientParams
      >
    ) => {
      return mutate({ clientId }, options);
    },
  };
};

export default useDeleteClients;
