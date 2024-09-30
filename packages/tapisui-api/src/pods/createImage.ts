import { Pods } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../utils';

const createImage = (
  params: Pods.AddImageRequest,
  basePath: string,
  jwt: string
): Promise<Pods.ImageResponse> => {
  const api: Pods.ImagesApi = apiGenerator<Pods.ImagesApi>(
    Pods,
    Pods.ImagesApi,
    basePath,
    jwt
  );
  return errorDecoder<Pods.ImageResponse>(() => api.addImage(params));
};

export default createImage;
