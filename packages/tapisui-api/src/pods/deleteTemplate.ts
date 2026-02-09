import { Pods } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../utils';

interface DeleteTemplateParams {
  templateId: string;
  force?: boolean;
}

const deleteTemplate = (
  params: DeleteTemplateParams,
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
    api.deleteTemplate({
      templateId: params.templateId,
      force: params.force,
    })
  );
};

export default deleteTemplate;
