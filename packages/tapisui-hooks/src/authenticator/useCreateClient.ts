import { useMutation, MutateOptions } from 'react-query';
import { Authenticator as API } from '@tapis/tapisui-api';
import { Authenticator } from '@tapis/tapis-typescript';
import { useTapisConfig } from '../context';

type CreateClientParams = {
  reqCreateClient: Authenticator.ReqCreateClient;
};

const useCreateClient = () => {
  const { accessToken, basePath } = useTapisConfig();
  const jwt = accessToken?.access_token || '';

  const { mutate, isLoading, isError, isSuccess, data, error, reset } =
    useMutation<Authenticator.RespCreateClient, Error, CreateClientParams>(
      ({ reqCreateClient }) =>
        API.createClient({ reqCreateClient }, basePath, jwt)
    );

  return {
    isLoading,
    isSuccess,
    isError,
    data,
    error,
    reset,
    mutate,
    createClient: (
      reqCreateClient: Authenticator.ReqCreateClient,
      options?: MutateOptions<
        Authenticator.RespCreateClient,
        Error,
        CreateClientParams
      >
    ) => {
      return mutate({ reqCreateClient }, options);
    },
  };
};

export default useCreateClient;
