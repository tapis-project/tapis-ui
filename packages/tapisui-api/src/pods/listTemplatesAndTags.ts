import { Pods } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../utils';

const listTemplatesAndTags = (
  params: Pods.ListTemplatesAndTagsRequest,
  basePath: string,
  jwt: string
): Promise<any> => {
  const api: Pods.TemplatesApi = apiGenerator<Pods.TemplatesApi>(
    Pods,
    Pods.TemplatesApi,
    basePath,
    jwt
  );
  return errorDecoder<any>(() => api.listTemplatesAndTags(params));
};

export default listTemplatesAndTags;
