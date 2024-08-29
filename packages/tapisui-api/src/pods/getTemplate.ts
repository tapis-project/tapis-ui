import { Pods } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../utils';

const getTemplate = (
  params: Pods.GetTemplateRequest,
  basePath: string,
  jwt: string
): Promise<Pods.TemplateResponse> => {
  const api: Pods.TemplatesApi = apiGenerator<Pods.TemplatesApi>(
    Pods,
    Pods.TemplatesApi,
    basePath,
    jwt
  );
  return errorDecoder<Pods.TemplateResponse>(() => api.getTemplate(params));
};

export default getTemplate;
