import { Jobs } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../utils';

const searchSQL = (
  params: Jobs.GetJobSearchListByPostSqlStrRequest,
  basePath: string,
  jwt: string
) => {
  const api: Jobs.JobsApi = apiGenerator<Jobs.JobsApi>(
    Jobs,
    Jobs.JobsApi,
    basePath,
    jwt
  );
  return errorDecoder<Jobs.RespJobSearchAllAttributes>(() =>
    api.getJobSearchListByPostSqlStr(params)
  );
};

export default searchSQL;
