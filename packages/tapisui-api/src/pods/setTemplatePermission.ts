import { Pods } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../utils';

const setTemplatePermission = (
  params: Pods.SetTemplatePermissionRequest,
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
    api.setTemplatePermission(params)
  );
};

export default setTemplatePermission;
