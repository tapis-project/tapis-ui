import { Models } from '@mlhub/ts-sdk';
import { apiGenerator, errorDecoder } from '../../../utils';

export type IngestParams = {
  platform: Models.Platform;
  modelId: string;
  ingestArtifactRequest: Models.IngestArtifactRequest;
};

const ingestModelByPlatform = (
  params: IngestParams,
  basePath: string,
  jwt: string
) => {
  const api: Models.PlatformsApi = apiGenerator<Models.PlatformsApi>(
    Models,
    Models.PlatformsApi,
    basePath,
    jwt
  );
  return errorDecoder<Models.IngestModelArtifactResponse>(() =>
    api.ingestExternalModel({
      platform: params.platform,
      modelId: params.modelId,
      ingestArtifactRequest: params.ingestArtifactRequest,
    })
  );
};

export default ingestModelByPlatform;
