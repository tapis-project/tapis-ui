import { Files } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../utils';

const mkdir = (
  systemId: string,
  path: string,
  basePath: string,
  jwt: string
) => {
  const api: Files.FileOperationsApi = apiGenerator<Files.FileOperationsApi>(
    Files,
    Files.FileOperationsApi,
    basePath,
    jwt
  );
  return errorDecoder<Files.FileStringResponse>(() =>
    api.mkdir({ systemId, mkdirRequest: { path } })
  );
};

export default mkdir;
