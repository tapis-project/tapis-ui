import {
  useMutation,
  MutateOptions,
  useQueryClient,
} from 'react-query';
import { Authenticator as API } from '@tapis/tapisui-api';
import { Authenticator } from '@tapis/tapis-typescript';
import { useTapisConfig } from 'context';
import QueryKeys from './queryKeys';

type UpdateClientParams = {
  clientId: string;
  callback_url: string;
  display_name: string;
};

const useUpdateClient = () => {
  const { accessToken, basePath } = useTapisConfig();
  const jwt = accessToken?.access_token || '';
  const queryClient = useQueryClient();

  const { mutate, isLoading, isError, isSuccess, data, error, reset } =
    useMutation<Authenticator.RespUpdateClient, Error, UpdateClientParams>(
      ({ clientId, callback_url, display_name }) =>
        API.updateClient(clientId, basePath, jwt, callback_url, display_name)
    );
  const invalidate = () => {
    queryClient.invalidateQueries([QueryKeys.updateClient]);
  };

  return {
    isError,
    isLoading,
    isSuccess,
    error,
    reset,
    data,
    invalidate,
    updateClient: (
      clientId: string,
      callback_url: string,
      display_name: string,
      options?: MutateOptions<
        Authenticator.RespUpdateClient,
        Error,
        UpdateClientParams
      >
    ) => {
      return mutate({ clientId, callback_url, display_name }, options);
    },
  };
};

export default useUpdateClient;
