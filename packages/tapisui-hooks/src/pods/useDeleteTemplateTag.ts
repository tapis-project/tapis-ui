import { useMutation, MutateOptions } from 'react-query';
import { Pods } from '@tapis/tapis-typescript';
import { Pods as API } from '@tapis/tapisui-api';
import { useTapisConfig } from '../context';
import QueryKeys from './queryKeys';

interface DeleteTemplateTagParams {
  templateId: string;
  tagId: string;
  force?: boolean;
}

const useDeleteTemplateTag = () => {
  const { basePath, accessToken } = useTapisConfig();
  const jwt = accessToken?.access_token || '';

  // The useMutation react-query hook is used to call operations that make server-side changes
  const {
    mutate,
    mutateAsync,
    isLoading,
    isError,
    isSuccess,
    data,
    error,
    reset,
  } = useMutation<any, Error, DeleteTemplateTagParams>(
    [QueryKeys.deleteTemplateTag, basePath, jwt],
    (params) => API.deleteTemplateTag(params, basePath, jwt)
  );

  // Return hook object with loading states and delete function
  return {
    isLoading,
    isError,
    isSuccess,
    data,
    error,
    reset,
    deleteTemplateTag: (
      params: DeleteTemplateTagParams,
      // MutateOptions is a type that allows us to specify things like onSuccess
      options?: MutateOptions<any, Error, DeleteTemplateTagParams>
    ) => mutate(params, options),
    deleteTemplateTagAsync: (
      params: DeleteTemplateTagParams,
      options?: MutateOptions<any, Error, DeleteTemplateTagParams>
    ) => mutateAsync(params, options),
  };
};

export default useDeleteTemplateTag;
