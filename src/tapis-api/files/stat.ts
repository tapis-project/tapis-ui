import { Files } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from 'tapis-api/utils';

const stat = (
  params: Files.GetStatInfoRequest,
  basePath: string,
  jwt: string
) => {
  const api: Files.FileOperationsApi = apiGenerator<Files.FileOperationsApi>(
    Files,
    Files.FileOperationsApi,
    basePath,
    jwt
  );
  return errorDecoder<Files.FileStatInfoResponse>(() =>
    api.getStatInfo(params)
  );
};

export default stat;
