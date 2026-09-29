import * as Models from '@mlhub/models-ts-sdk';
import { apiGenerator, errorDecoder } from '../../utils';

export type ListExternalModelDeploymentOptionsParams =
  Models.ListExternalModelDeploymentOptionsRequest;

const listExternalModelDeploymentOptions = (
  params: ListExternalModelDeploymentOptionsParams,
  basePath: string,
  jwt: string
) => {
  const api: Models.ExternalModelsApi = apiGenerator<Models.ExternalModelsApi>(
    Models,
    Models.ExternalModelsApi,
    basePath,
    jwt
  );

  return errorDecoder<Models.ListExternalModelDeploymentOptionsResponse>(() =>
    api.listExternalModelDeploymentOptions(params)
  );
};

export default listExternalModelDeploymentOptions;
