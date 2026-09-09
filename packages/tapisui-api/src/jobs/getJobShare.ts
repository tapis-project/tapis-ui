import { Jobs } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../utils';

/**
 * Who this job has been shared with, and which of its parts they hold.
 *
 * Unlike a system or an app, a job is not shared whole: a grantee is given
 * named RESOURCES (history, output, input, the resubmit request), so the
 * answer here is a list of rows, several per person.
 */
const getJobShare = (
  params: Jobs.GetJobShareRequest,
  basePath: string,
  jwt: string
) => {
  const api: Jobs.SharingApi = apiGenerator<Jobs.SharingApi>(
    Jobs,
    Jobs.SharingApi,
    basePath,
    jwt
  );
  return errorDecoder<Jobs.RespGetJobShareList>(() => api.getJobShare(params));
};

export default getJobShare;
