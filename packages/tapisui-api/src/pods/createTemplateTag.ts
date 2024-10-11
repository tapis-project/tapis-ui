import { Pods } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../utils';

const createTemplateTag = (
  params: Pods.AddTemplateTagRequest,
  basePath: string,
  jwt: string
): Promise<Pods.TemplateTagResponse> => {
  const api: Pods.TemplatesApi = apiGenerator<Pods.TemplatesApi>(
    Pods,
    Pods.TemplatesApi,
    basePath,
    jwt
  );
  return errorDecoder<Pods.TemplateTagResponse>(() =>
    api.addTemplateTag(params)
  );
};

export default createTemplateTag;
