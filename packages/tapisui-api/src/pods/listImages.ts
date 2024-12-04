import { Pods } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../utils';

const listImages = (
  basePath: string,
  jwt: string
): Promise<Pods.ImagesResponse> => {
  const api: Pods.ImagesApi = apiGenerator<Pods.ImagesApi>(
    Pods,
    Pods.ImagesApi,
    basePath,
    jwt
  );
  return errorDecoder<Pods.ImagesResponse>(() => api.getImages());
};

export default listImages;
