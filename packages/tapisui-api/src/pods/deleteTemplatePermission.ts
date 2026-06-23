import { Pods } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../utils';

const deleteTemplatePermission = (
  params: Pods.DeleteTemplatePermissionRequest,
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
    api.deleteTemplatePermission(params)
  );
};

export default deleteTemplatePermission;
