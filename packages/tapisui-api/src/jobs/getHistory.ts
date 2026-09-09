import { Jobs } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../utils';

/** the run's own event ledger — every status change, with its detail */
const getHistory = (
  params: Jobs.GetJobHistoryRequest,
  basePath: string,
  jwt: string
) => {
  const api: Jobs.JobsApi = apiGenerator<Jobs.JobsApi>(
    Jobs,
    Jobs.JobsApi,
    basePath,
    jwt
  );
  return errorDecoder<Jobs.RespJobHistory>(() => api.getJobHistory(params));
};

export default getHistory;
