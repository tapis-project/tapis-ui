import { useMutation, MutateOptions } from 'react-query';
import { useTapisConfig } from '../context';
import QueryKeys from './queryKeys';
import { Apps } from '@tapis/tapis-typescript';
import { createApp } from 'tapis-api/apps';

type createAppParams = {
  createAppVersionRequest: Apps.CreateAppVersionRequest;
  skipCredentialCheck: boolean;
};

const useCreateApp = () => {
  const { basePath, accessToken } = useTapisConfig();
  const jwt = accessToken?.access_token || '';

  const { mutate, isLoading, isError, isSuccess, data, error, reset } =
    useMutation<Apps.RespBasic, Error, createAppParams>(
      [QueryKeys.createApp, basePath, jwt],
      ({ createAppVersionRequest }) =>
        createApp(createAppVersionRequest, basePath, jwt)
    );

  return {
    isLoading,
    isError,
    isSuccess,
    data,
    error,
    reset,
    createApp: (
      createAppVersionRequest: Apps.CreateAppVersionRequest,
      skipCredentialCheck: boolean = true,
      options?: MutateOptions<Apps.RespBasic, Error, createAppParams>
    ) => {
      return mutate({ createAppVersionRequest, skipCredentialCheck }, options);
    },
  };
};

export default useCreateApp;
