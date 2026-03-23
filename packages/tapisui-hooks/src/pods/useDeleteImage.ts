import { useMutation, MutateOptions } from 'react-query';
import { Pods } from '@tapis/tapis-typescript';
import { Pods as API } from '@tapis/tapisui-api';
import { useTapisConfig } from '../context';
import QueryKeys from './queryKeys';

type DeleteImageHookParams = Pods.DeleteImageRequest;

const useDeleteImage = () => {
  const { basePath, accessToken } = useTapisConfig();
  const jwt = accessToken?.access_token || '';

  const { mutate, isLoading, isError, isSuccess, data, error, reset } =
    useMutation<Pods.ImageDeleteResponse, Error, DeleteImageHookParams>(
      [QueryKeys.deleteImage, basePath, jwt],
      (params) => API.deleteImage(params, basePath, jwt)
    );

  return {
    isLoading,
    isError,
    isSuccess,
    data,
    error,
    reset,
    deleteImage: (
      params: DeleteImageHookParams,
      options?: MutateOptions<
        Pods.ImageDeleteResponse,
        Error,
        DeleteImageHookParams
      >
    ) => mutate(params, options),
  };
};

export default useDeleteImage;
