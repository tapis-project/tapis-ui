import { Pods } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../utils';

interface DeleteTemplateTagParams {
  templateId: string;
  tagId: string;
  force?: boolean;
}

const deleteTemplateTag = (
  params: DeleteTemplateTagParams,
  basePath: string,
  jwt: string
): Promise<any> => {
  const api: Pods.TemplatesApi = apiGenerator<Pods.TemplatesApi>(
    Pods,
    Pods.TemplatesApi,
    basePath,
    jwt
  );
  return errorDecoder<any>(() =>
    api.deleteTemplateTag({
      templateId: params.templateId,
      tagId: params.tagId,
      force: params.force,
    })
  );
};

export default deleteTemplateTag;
