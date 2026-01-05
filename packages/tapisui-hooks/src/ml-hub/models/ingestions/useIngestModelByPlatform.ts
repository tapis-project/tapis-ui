import { useMutation, MutateOptions } from 'react-query';
import { MLHub as API } from '@tapis/tapisui-api';
import { useTapisConfig } from '../../..';
import { Models } from '@mlhub/ts-sdk';

type Variables = {
  platform: Models.Platform;
  modelId: string;
  ingestArtifactRequest?: Models.IngestArtifactRequest;
};

const defaultBody: Models.IngestArtifactRequest = {} as any;

const useIngestModelByPlatform = () => {
  const { accessToken, mlHubBasePath } = useTapisConfig();

  const { mutate, isLoading, isError, isSuccess, data, error, reset } =
    useMutation<Models.IngestModelArtifactResponse, Error, Variables>(
      ['mlhub-platforms-ingest', mlHubBasePath, accessToken?.access_token],
      (vars) =>
        API.Models.Ingestions.ingestModelByPlatform(
          {
            platform: vars.platform,
            modelId: vars.modelId,
            ingestArtifactRequest: vars.ingestArtifactRequest || defaultBody,
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
    ingest: (
      request: Variables,
      options?: MutateOptions<
        Models.IngestModelArtifactResponse,
        Error,
        Variables
      >
    ) => mutate(request, options),
  };
};

export default useIngestModelByPlatform;
