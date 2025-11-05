import { Models } from '@mlhub/ts-sdk';
import { apiGenerator, errorDecoder } from '../../../utils';

const listPublicationsForArtifact = (
  artifactId: string,
  basePath: string,
  jwt: string
) => {
  const api: Models.PublicationsApi = apiGenerator<Models.PublicationsApi>(
    Models,
    Models.PublicationsApi,
    basePath,
    jwt
  );
  return errorDecoder<Models.ListModelPublicationsForArtifactResponse>(() =>
    api.listPublicationsForArtifact({ artifactId })
  );
};

export default listPublicationsForArtifact;
