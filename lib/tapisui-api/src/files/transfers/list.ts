import { Files } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../../utils';

export const list = (
  params: Files.GetRecentTransferTasksRequest,
  basePath: string,
  jwt: string
) => {
  const api: Files.TransfersApi = apiGenerator<Files.TransfersApi>(
    Files,
    Files.TransfersApi,
    basePath,
    jwt
  );
  return errorDecoder<Files.TransferTaskListResponse>(() =>
    api.getRecentTransferTasks(params)
  );
};

export default list;
