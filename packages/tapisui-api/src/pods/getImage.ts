import { Pods } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../utils';

const getImage = (
  params: Pods.GetImageRequest,
  basePath: string,
  jwt: string
): Promise<Pods.ResponseGetImage> => {
  const api: Pods.ImagesApi = apiGenerator<Pods.ImagesApi>(
    Pods,
    Pods.ImagesApi,
    basePath,
    jwt
  );
  return errorDecoder<Pods.ResponseGetImage>(() => api.getImage(params));
};

export default getImage;
