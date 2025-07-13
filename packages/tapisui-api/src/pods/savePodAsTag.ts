import { Pods } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../utils';

const savePodAsTag = (
  params: Pods.SavePodAsTemplateTagRequest,
  basePath: string,
  jwt: string
): Promise<Pods.TemplateTagResponse> => {
  const api: Pods.PodsApi = apiGenerator<Pods.PodsApi>(
    Pods,
    Pods.PodsApi,
    basePath,
    jwt
  );
  return errorDecoder<Pods.TemplateTagResponse>(() =>
    api.savePodAsTemplateTag(params)
  );
};

export default savePodAsTag;
