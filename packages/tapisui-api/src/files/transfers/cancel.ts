import { Files } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../../utils';

export const cancel = (
  transferTaskId: string,
  basePath: string,
  jwt: string
) => {
  const api: Files.TransfersApi = apiGenerator<Files.TransfersApi>(
    Files,
    Files.TransfersApi,
    basePath,
    jwt
  );
  return errorDecoder<Files.StringResponse>(() =>
    api.cancelTransferTask({ transferTaskId })
  );
};

export default cancel;
