import { Files } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../../utils';

export const create = (
  params: Files.CreatePostItOperationRequest,
  basePath: string,
  jwt: string
) => {
  const api: Files.PostItsApi = apiGenerator<Files.PostItsApi>(
    Files,
    Files.PostItsApi,
    basePath,
    jwt
  );
  return errorDecoder<Files.PostItResponse>(() => api.createPostIt(params));
};

export default create;
