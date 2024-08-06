import { Files } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../utils';

const insert = (
  systemId: string,
  path: string,
  file: Blob,
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
    api.insert({ systemId, path, file })
  );
};

export default insert;
