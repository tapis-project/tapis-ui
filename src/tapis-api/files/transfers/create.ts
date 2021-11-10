import { Files } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from 'tapis-api/utils';

export const create = (
  elements: Array<Files.TransferTaskRequestElement>,
  basePath: string,
  jwt: string
) => {
  const api: Files.TransfersApi = apiGenerator<Files.TransfersApi>(
    Files,
    Files.TransfersApi,
    basePath,
    jwt
  );
  return errorDecoder<Files.TransferTaskResponse>(() =>
    api.createTransferTask({ transferTaskRequest: { elements }})
  );
};

export default create;
