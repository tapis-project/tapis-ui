import { Jobs } from '@tapis/tapis-typescript';
import { apiGenerator, errorDecoder } from '../utils';

/**
 * Read one of a job's output files as text.
 *
 * The generated client hands back a Blob; every caller so far wants the words,
 * so the decode happens here rather than in each hook. `allowIfRunning` is the
 * point of this operation — a job's stdout is most interesting before the job
 * has finished writing it.
 */
const getJobOutputText = async (
  params: Jobs.GetJobOutputDownloadRequest,
  basePath: string,
  jwt: string
): Promise<string> => {
  const api: Jobs.JobsApi = apiGenerator<Jobs.JobsApi>(
    Jobs,
    Jobs.JobsApi,
    basePath,
    jwt
  );
  const blob = await errorDecoder<Blob>(() => api.getJobOutputDownload(params));
  return blob.text();
};

export default getJobOutputText;
