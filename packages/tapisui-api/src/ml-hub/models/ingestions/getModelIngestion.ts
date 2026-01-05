import { Models } from '@mlhub/ts-sdk';
import { apiGenerator, errorDecoder } from '../../../utils';

const getModelIngestion = (
  ingestionId: string,
  basePath: string,
  jwt: string
) => {
  const api: Models.IngestionsApi = apiGenerator<Models.IngestionsApi>(
    Models,
    Models.IngestionsApi,
    basePath,
    jwt
  );
  return errorDecoder<Models.GetModelIngestionResponse>(() =>
    api.getModelIngestion({ ingestionId })
  );
};

export default getModelIngestion;
