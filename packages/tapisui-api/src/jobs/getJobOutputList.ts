import { Jobs } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../utils';

const getJobOutputList = (
  params: Jobs.GetJobOutputListRequest,
  basePath: string,
  jwt: string
) => {
  const api: Jobs.JobsApi = apiGenerator<Jobs.JobsApi>(
    Jobs,
    Jobs.JobsApi,
    basePath,
    jwt
  );
  return errorDecoder<Jobs.RespGetJobOutputList>(() =>
    api.getJobOutputList(params)
  );
};

export default getJobOutputList;
