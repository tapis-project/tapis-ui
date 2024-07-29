import { Files } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../../utils';

export const create = (
  transferTaskRequest: Files.TransferTaskRequest,
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
    api.createTransferTask({ transferTaskRequest })
  );
};

export default create;
