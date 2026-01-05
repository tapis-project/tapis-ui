import { Models } from '@mlhub/ts-sdk';
import { apiGenerator, errorDecoder } from '../../../utils';

const listModelArtifacts = (basePath: string, jwt: string) => {
  const api: Models.ArtifactsApi = apiGenerator<Models.ArtifactsApi>(
    Models,
    Models.ArtifactsApi,
    basePath,
    jwt
  );
  return errorDecoder<Models.ListModelArtifactResponse>(() =>
    api.listModelArtifacts()
  );
};

export default listModelArtifacts;
