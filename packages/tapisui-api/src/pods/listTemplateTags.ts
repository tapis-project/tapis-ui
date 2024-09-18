import { Pods } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../utils';

const listTemplateTags = (
  params: Pods.ListTemplateTagsRequest,
  basePath: string,
  jwt: string
): Promise<any> => {
  const api: Pods.TemplatesApi = apiGenerator<Pods.TemplatesApi>(
    Pods,
    Pods.TemplatesApi,
    basePath,
    jwt
  );
  return errorDecoder<any>(() => api.listTemplateTags(params));
};

export default listTemplateTags;
