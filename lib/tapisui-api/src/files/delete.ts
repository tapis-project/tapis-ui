import { Files } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../utils';

const deleteFile = (
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
    api._delete({ systemId, path })
  );
};

export default deleteFile;
