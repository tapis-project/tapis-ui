import { useMutation, MutateOptions } from 'react-query';
import { Pods } from '@tapis/tapis-typescript';
import { Pods as API } from '@tapis/tapisui-api';
import { useTapisConfig } from '../context';
import QueryKeys from './queryKeys';

interface DeleteTemplateParams {
  templateId: string;
  force?: boolean;
}

const useDeleteTemplate = () => {
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
  } = useMutation<any, Error, DeleteTemplateParams>(
    [QueryKeys.deleteTemplate, basePath, jwt],
    (params) => API.deleteTemplate(params, basePath, jwt)
  );

  // Return hook object with loading states and delete function
  return {
    isLoading,
    isError,
    isSuccess,
    data,
    error,
    reset,
    deleteTemplate: (
      params: DeleteTemplateParams,
      // MutateOptions is a type that allows us to specify things like onSuccess
      options?: MutateOptions<any, Error, DeleteTemplateParams>
    ) => mutate(params, options),
    deleteTemplateAsync: (
      params: DeleteTemplateParams,
      options?: MutateOptions<any, Error, DeleteTemplateParams>
    ) => mutateAsync(params, options),
  };
};

export default useDeleteTemplate;
