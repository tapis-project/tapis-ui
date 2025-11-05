import { Models } from '@mlhub/ts-sdk';
import { apiGenerator, errorDecoder } from '../../../utils';

const getModelPublication = (
  publicationId: string,
  basePath: string,
  jwt: string
) => {
  const api: Models.PublicationsApi = apiGenerator<Models.PublicationsApi>(
    Models,
    Models.PublicationsApi,
    basePath,
    jwt
  );
  return errorDecoder<Models.GetModelPublicationResponse>(() =>
    api.getModelPublication({ publicationId })
  );
};

export default getModelPublication;
