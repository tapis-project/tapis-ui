import { useMutation, MutateOptions } from 'react-query';
import { Pods } from '@tapis/tapis-typescript';
import { Pods as API } from '@tapis/tapisui-api';
import { useTapisConfig } from '../context';
import QueryKeys from './queryKeys';
import { savePodAsTag } from '@tapis/tapisui-api/dist/pods';

type hookParams = Pods.SavePodAsTemplateTagRequest;

const useSavePodAsTag = () => {
  const { basePath, accessToken } = useTapisConfig();
  const jwt = accessToken?.access_token || '';

  // The useMutation react-query hook is used to call operations that make server-side changes
  // (Other hooks would be used for data retrieval)
  //
  // In this case, mkdir helper is called to perform the operation
  const { mutate, isLoading, isError, isSuccess, data, error, reset } =
    useMutation<Pods.TemplateTagResponse, Error, hookParams>(
      [QueryKeys.savePodAsTag, basePath, jwt],
      (params) => API.savePodAsTag(params, basePath, jwt)
    );

  // Return hook object with loading states and login function
  return {
    isLoading,
    isError,
    isSuccess,
    data,
    error,
    reset,
    savePodAsTag: (
      params: hookParams,
      // MutateOptions is a type that allows us to specify things like onSuccess
      options?: MutateOptions<Pods.TemplateTagResponse, Error, hookParams>
    ) => mutate(params, options),
  };
};

export default useSavePodAsTag;
