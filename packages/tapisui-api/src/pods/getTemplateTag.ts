import { Pods } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../utils';

const getTemplateTag = (
  params: Pods.ListTemplateTagsRequest,
  basePath: string,
  jwt: string
): Promise<Pods.TemplateTagsResponse> => {
  const api: Pods.TemplatesApi = apiGenerator<Pods.TemplatesApi>(
    Pods,
    Pods.TemplatesApi,
    basePath,
    jwt
  );
  return errorDecoder<Pods.TemplateTagsResponse>(() =>
    api.listTemplateTags(params)
  );
};

export default getTemplateTag;
