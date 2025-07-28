import {
  useMutation,
  MutateOptions,
  QueryClient,
  useQueryClient,
} from 'react-query';
import { Authenticator as API } from '@tapis/tapisui-api';
import { Authenticator } from '@tapis/tapis-typescript';
import { useTapisConfig } from '../context';
import QueryKeys from './queryKeys';
import { updateClient } from '@tapis/tapisui-api/dist/authenticator';

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
        API.updateClient(
          { clientId, updateClient: { callback_url, display_name } },
          basePath,
          jwt
        )
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
      params: UpdateClientParams,
      options?: MutateOptions<
        Authenticator.RespUpdateClient,
        Error,
        UpdateClientParams
      >
    ) => {
      return mutate(params, options);
    },
  };
};

export default useUpdateClient;
