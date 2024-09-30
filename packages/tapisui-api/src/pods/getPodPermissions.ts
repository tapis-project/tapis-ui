import { Pods } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../utils';

const getPodPermissions = (
  params: Pods.GetPodPermissionsRequest,
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
    api.getPodPermissions(params)
  );
};

export default getPodPermissions;
