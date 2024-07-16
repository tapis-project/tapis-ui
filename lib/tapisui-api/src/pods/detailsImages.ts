import { Pods } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../utils';

const detailsImages = (
  params: Pods.GetImageRequest,
  basePath: string,
  jwt: string
) => {
  const api: Pods.ImagesApi = apiGenerator<Pods.ImagesApi>(
    Pods,
    Pods.ImagesApi,
    basePath,
    jwt
  );
  return errorDecoder<Pods.ImageResponse>(() => api.getImage(params));
};

export default detailsImages;
