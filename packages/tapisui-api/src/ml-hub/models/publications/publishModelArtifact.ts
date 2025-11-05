import { Models } from '@mlhub/ts-sdk';
import { apiGenerator, errorDecoder } from '../../../utils';

export type PublishParams = {
  artifactId: string;
  publishArtifactRequest: Models.PublishArtifactRequest;
};

const publishModelArtifact = (
  params: PublishParams,
  basePath: string,
  jwt: string
) => {
  const api: Models.PublicationsApi = apiGenerator<Models.PublicationsApi>(
    Models,
    Models.PublicationsApi,
    basePath,
    jwt
  );
  return errorDecoder<Models.PublishModelArtifactResponse>(() =>
    api.publishModelArtifact({
      artifactId: params.artifactId,
      publishArtifactRequest: params.publishArtifactRequest,
    })
  );
};

export default publishModelArtifact;
