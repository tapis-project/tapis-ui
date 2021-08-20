import { Files } from '@tapis/tapis-typescript';
import { apiGenerator } from 'tapis-api/utils';
import { errorDecoder } from 'tapis-api/utils';

const list = (params: Files.ListFilesRequest, basePath: string, jwt: string) => {
  const api: Files.FileOperationsApi = apiGenerator<Files.FileOperationsApi>(
    Files, Files.FileOperationsApi, basePath, jwt
  );
  return errorDecoder<Files.FileListingResponse>(
    () => api.listFiles(params)
  );
}

export default list;