import { Models } from '@mlhub/ts-sdk';
import { apiGenerator, errorDecoder } from '../../../utils';

const listModelPublications = (basePath: string, jwt: string) => {
  const api: Models.PublicationsApi = apiGenerator<Models.PublicationsApi>(
    Models,
    Models.PublicationsApi,
    basePath,
    jwt
  );
  return errorDecoder<Models.ListModelPublicationsResponse>(() =>
    api.listModelPublications()
  );
};

export default listModelPublications;
