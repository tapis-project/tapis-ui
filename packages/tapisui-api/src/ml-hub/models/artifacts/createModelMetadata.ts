import { Models } from '@mlhub/ts-sdk';
import { apiGenerator, errorDecoder } from '../../../utils';

export type CreateModelMetadataParams = {
  artifactId: string;
  metadata: Record<string, any>;
};

const createModelMetadata = (
  params: CreateModelMetadataParams,
  basePath: string,
  jwt: string
) => {
  const api: Models.ArtifactsApi = apiGenerator<Models.ArtifactsApi>(
    Models,
    Models.ArtifactsApi,
    basePath,
    jwt
  );

  return errorDecoder<any>(() =>
    (api as any).createModelMetadata({
      artifactId: params.artifactId,
      body: params.metadata,
    })
  );
};

export default createModelMetadata;
