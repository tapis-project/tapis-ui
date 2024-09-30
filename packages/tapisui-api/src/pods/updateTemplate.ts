import { Pods } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../utils';

const updateTemplate = (
  params: Pods.UpdateTemplateRequest,
  basePath: string,
  jwt: string
): Promise<Pods.TemplateResponse> => {
  const api: Pods.TemplatesApi = apiGenerator<Pods.TemplatesApi>(
    Pods,
    Pods.TemplatesApi,
    basePath,
    jwt
  );
  return errorDecoder<Pods.TemplateResponse>(() => api.updateTemplate(params));
};

export default updateTemplate;
