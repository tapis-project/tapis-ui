import * as Models from '@mlhub/models-ts-sdk';
import { apiGenerator, errorDecoder } from '../../utils';

export type GetModelParams =
  | Models.GetModelRequest
  | { author?: string; name?: string };

const getModel = (params: GetModelParams, basePath: string, jwt: string) => {
  const api: Models.ModelsApi = apiGenerator<Models.ModelsApi>(
    Models,
    Models.ModelsApi,
    basePath,
    jwt
  );
  return errorDecoder<Models.GetModelResponse>(async () => {
    if ('modelId' in params) {
      return api.getModel(params);
    }

    const response = await api.listModels({
      scope: Models.ListModelsScopeEnum.Owned,
    });
    const model = response.result.find(
      (item) =>
        (item.external_model.metadata.derived.author ?? item.owner) ===
          params.author && item.name === params.name
    );

    if (!model) {
      throw new Error('Model not found in your collection');
    }

    return { ...response, result: model };
  });
};

export default getModel;
