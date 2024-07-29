import { Files } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../utils';

const nativeOp = (
  systemId: string,
  path: string,
  recursive: boolean,
  operation: Files.NativeLinuxOpRequestOperationEnum,
  argument: string,
  basePath: string,
  jwt: string
) => {
  const api: Files.FileOperationsApi = apiGenerator<Files.FileOperationsApi>(
    Files,
    Files.FileOperationsApi,
    basePath,
    jwt
  );
  const params: Files.RunLinuxNativeOpRequest = {
    systemId,
    path,
    recursive,
    nativeLinuxOpRequest: {
      operation,
      argument,
    },
  };
  return errorDecoder<Files.NativeLinuxOpResultResponse>(() =>
    api.runLinuxNativeOp(params)
  );
};

export default nativeOp;
