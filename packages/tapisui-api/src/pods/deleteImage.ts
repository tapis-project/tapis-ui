import { Pods } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../utils';

const deleteImage = (
  params: Pods.DeleteImageRequest,
  basePath: string,
  jwt: string
): Promise<Pods.ImageDeleteResponse> => {
  const api: Pods.ImagesApi = apiGenerator<Pods.ImagesApi>(
    Pods,
    Pods.ImagesApi,
    basePath,
    jwt
  );
  return errorDecoder<Pods.ImageDeleteResponse>(() => api.deleteImage(params));
};

export default deleteImage;
