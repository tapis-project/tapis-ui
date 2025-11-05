import { useMutation, MutateOptions } from 'react-query';
import { MLHub as API } from '@tapis/tapisui-api';
import { useTapisConfig } from '../../..';
import { Models } from '@mlhub/ts-sdk';

type Variables = {
  artifactId: string;
  publishArtifactRequest?: Models.PublishArtifactRequest;
};

const defaultBody: Models.PublishArtifactRequest = {} as any;

const usePublishModelArtifact = () => {
  const { accessToken, mlHubBasePath } = useTapisConfig();

  const { mutate, isLoading, isError, isSuccess, data, error, reset } =
    useMutation<Models.PublishModelArtifactResponse, Error, Variables>(
      ['mlhub-publications-publish', mlHubBasePath, accessToken?.access_token],
      (vars) =>
        API.Models.Publications.publishModelArtifact(
          {
            artifactId: vars.artifactId,
            publishArtifactRequest: vars.publishArtifactRequest || defaultBody,
          },
          mlHubBasePath + '/mlhub',
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
    publish: (
      request: Variables,
      options?: MutateOptions<
        Models.PublishModelArtifactResponse,
        Error,
        Variables
      >
    ) => mutate(request, options),
  };
};

export default usePublishModelArtifact;
