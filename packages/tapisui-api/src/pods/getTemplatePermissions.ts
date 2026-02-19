import { Pods } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../utils';

const getTemplatePermissions = (
  params: Pods.GetTemplatePermissionsRequest,
  basePath: string,
  jwt: string
): Promise<Pods.TemplatePermissionsResponse> => {
  const api: Pods.PermissionsApi = apiGenerator<Pods.PermissionsApi>(
    Pods,
    Pods.PermissionsApi,
    basePath,
    jwt
  );
  return errorDecoder<Pods.TemplatePermissionsResponse>(() =>
    api.getTemplatePermissions(params)
  );
};

export default getTemplatePermissions;
