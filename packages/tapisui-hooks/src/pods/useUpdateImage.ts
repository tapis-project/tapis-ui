import { useEffect } from 'react';
import { useMutation, MutateOptions } from 'react-query';
import { Pods } from '@tapis/tapis-typescript';
import { Pods as API } from '@tapis/tapisui-api';
import { useTapisConfig } from '../context';
import QueryKeys from './queryKeys';

type UpdateImageHookParams = Pods.UpdateImageRequest;

const useUpdateImage = (imageId: string) => {
  const { basePath, accessToken } = useTapisConfig();
  const jwt = accessToken?.access_token || '';

  const { mutate, isLoading, isError, isSuccess, data, error, reset } =
    useMutation<Pods.ImageResponse, Error, Pods.UpdateImageRequest>(
      [QueryKeys.updateImage, imageId, basePath, jwt],
      (params) => API.updateImage(params, basePath, jwt)
    );

  useEffect(() => reset(), [reset, imageId]);

  return {
    isLoading,
    isError,
    isSuccess,
    data,
    error,
    reset,
    updateImage: (
      params: UpdateImageHookParams,
      options?: MutateOptions<Pods.ImageResponse, Error, UpdateImageHookParams>
    ) => {
      return mutate(params, options);
    },
  };
};

export default useUpdateImage;
