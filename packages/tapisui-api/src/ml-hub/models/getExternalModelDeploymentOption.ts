import * as Models from '@mlhub/models-ts-sdk';
import { apiGenerator, errorDecoder } from '../../utils';

export type GetExternalModelDeploymentOptionParams =
  Models.GetExternalModelDeploymentOptionRequest;

const getExternalModelDeploymentOption = (
  params: GetExternalModelDeploymentOptionParams,
  basePath: string,
  jwt: string
) => {
  const api = apiGenerator<Models.ExternalModelsApi>(
    Models,
    Models.ExternalModelsApi,
    basePath,
    jwt
  );

  return errorDecoder<Models.GetExternalModelDeploymentOptionResponse>(() =>
    api.getExternalModelDeploymentOption(params)
  );
};

export default getExternalModelDeploymentOption;
