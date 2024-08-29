import { Pods } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../utils';

const getTemplateTag = (
  params: Pods.GetTemplateTagsRequest,
  basePath: string,
  jwt: string
): Promise<Pods.TemplateTagsSmallResponse> => {
  const api: Pods.TemplatesApi = apiGenerator<Pods.TemplatesApi>(
    Pods,
    Pods.TemplatesApi,
    basePath,
    jwt
  );
  return errorDecoder<Pods.TemplateTagsSmallResponse>(() =>
    api.getTemplateTags(params)
  );
};

export default getTemplateTag;
