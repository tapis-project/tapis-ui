import { useMutation, MutateOptions } from 'react-query';
import { MLHub as API } from '@tapis/tapisui-api';
import { useTapisConfig } from '../../..';

export type CreateModelMetadataVariables = {
  artifactId: string;
  metadata: Record<string, any>;
};

const useCreateModelMetadata = () => {
  const { accessToken, mlHubBasePath } = useTapisConfig();

  const { mutate, isLoading, isError, isSuccess, data, error, reset } =
    useMutation<any, Error, CreateModelMetadataVariables>(
      [
        'mlhub-artifacts-create-metadata',
        mlHubBasePath,
        accessToken?.access_token,
      ],
      (vars) =>
        API.Models.Artifacts.createModelMetadata(
          {
            artifactId: vars.artifactId,
            metadata: vars.metadata,
          },
          mlHubBasePath,
          accessToken?.access_token || ''
        )
    );

  return {
    isLoading,
    isError,
    isSuccess,
    data,
    error,
    reset,
    create: (
      request: CreateModelMetadataVariables,
      options?: MutateOptions<any, Error, CreateModelMetadataVariables>
    ) => mutate(request, options),
  };
};

export default useCreateModelMetadata;
