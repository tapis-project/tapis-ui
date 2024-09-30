import { useMutation, MutateOptions } from 'react-query';
import { Jobs } from '@tapis/tapis-typescript';
import { Jobs as API } from '@tapis/tapisui-api';
import { useTapisConfig } from '../';
import QueryKeys from './queryKeys';

const useResubmit = (params: Jobs.ResubmitJobRequest) => {
  const { basePath, accessToken } = useTapisConfig();
  const jwt = accessToken?.access_token || '';

  const { mutate, isLoading, isError, isSuccess, data, error, reset } =
    useMutation<Jobs.RespSubmitJob, Error, Jobs.ResubmitJobRequest>(
      [QueryKeys.resubmit, basePath, jwt],
      () => API.resubmit(params, basePath, jwt)
    );

  // // We want this hook to automatically reset if a different appId or appVersion
  // // is passed to it. This eliminates the need to reset it inside the TSX component
  // useEffect(() => reset(), [reset, appId, appVersion]);

  return {
    isLoading,
    isError,
    isSuccess,
    data,
    error,
    reset,
    resubmit: (
      options?: MutateOptions<
        Jobs.RespSubmitJob,
        Error,
        Jobs.ResubmitJobRequest
      >
    ) => {
      // Call mutate to trigger a single post-like API operation
      return mutate(params, options);
    },
  };
};

export default useResubmit;
