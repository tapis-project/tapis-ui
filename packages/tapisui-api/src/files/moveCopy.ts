import { Files } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../utils';

const moveCopy = (
  systemId: string,
  path: string,
  newPath: string,
  operation: Files.MoveCopyRequestOperationEnum,
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
    api.moveCopy({ systemId, path, moveCopyRequest: { operation, newPath } })
  );
};

export default moveCopy;
