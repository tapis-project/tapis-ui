import { useMutation, MutateOptions } from 'react-query';
import { Systems } from '@tapis/tapis-typescript';
import { Systems as API } from '@tapis/tapisui-api';
import { useTapisConfig } from '../context';
import QueryKeys from './queryKeys';

type createChildSystemParams = {
  reqPostChildSystem: Systems.ReqPostChildSystem;
  parentId: string;
};

const useCreateChildSystem = () => {
  const { basePath, accessToken } = useTapisConfig();
  const jwt = accessToken?.access_token || '';

  const { mutate, isLoading, isError, isSuccess, data, error, reset } =
    useMutation<Systems.RespBasic, Error, createChildSystemParams>(
      [QueryKeys.createChildSystem, basePath, jwt],
      ({ reqPostChildSystem, parentId }) =>
        API.createChildSystem(reqPostChildSystem, parentId, basePath, jwt)
    );

  return {
    isLoading,
    isError,
    isSuccess,
    data,
    error,
    reset,
    createChildSystem: (
      reqPostChildSystem: Systems.ReqPostChildSystem,
      parentId: string,
      options?: MutateOptions<Systems.RespBasic, Error, createChildSystemParams>
    ) => {
      return mutate({ reqPostChildSystem, parentId }, options);
    },
  };
};

export default useCreateChildSystem;
