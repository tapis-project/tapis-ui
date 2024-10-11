import { Pods } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../utils';

const listTemplates = (
  basePath: string,
  jwt: string
): Promise<Pods.TemplatesResponse> => {
  const api: Pods.TemplatesApi = apiGenerator<Pods.TemplatesApi>(
    Pods,
    Pods.TemplatesApi,
    basePath,
    jwt
  );
  return errorDecoder<Pods.TemplatesResponse>(() => api.listTemplates());
};

export default listTemplates;
