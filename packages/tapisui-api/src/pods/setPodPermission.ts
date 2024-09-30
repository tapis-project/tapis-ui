import { Pods } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../utils';

const setPodPermission = (
  params: Pods.SetPodPermissionRequest,
  basePath: string,
  jwt: string
): Promise<Pods.PodPermissionsResponse> => {
  const api: Pods.PermissionsApi = apiGenerator<Pods.PermissionsApi>(
    Pods,
    Pods.PermissionsApi,
    basePath,
    jwt
  );
  return errorDecoder<Pods.PodPermissionsResponse>(() =>
    api.setPodPermission(params)
  );
};

export default setPodPermission;
