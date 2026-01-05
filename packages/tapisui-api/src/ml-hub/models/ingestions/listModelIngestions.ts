import { Models } from '@mlhub/ts-sdk';
import { apiGenerator, errorDecoder } from '../../../utils';

const listModelIngestions = (basePath: string, jwt: string) => {
  const api: Models.IngestionsApi = apiGenerator<Models.IngestionsApi>(
    Models,
    Models.IngestionsApi,
    basePath,
    jwt
  );
  return errorDecoder<Models.ListModelIngestionsResponse>(() =>
    api.listModelIngestions()
  );
};

export default listModelIngestions;
