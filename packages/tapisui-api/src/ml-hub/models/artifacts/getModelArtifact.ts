import { Models } from '@mlhub/ts-sdk';
import { apiGenerator, errorDecoder } from '../../../utils';

const getModelArtifact = (
  artifactId: string,
  basePath: string,
  jwt: string
) => {
  const api: Models.ArtifactsApi = apiGenerator<Models.ArtifactsApi>(
    Models,
    Models.ArtifactsApi,
    basePath,
    jwt
  );
  return errorDecoder<Models.GetModelArtifactResponse>(() =>
    api.getModelArtifact({ artifactId })
  );
};

export default getModelArtifact;
