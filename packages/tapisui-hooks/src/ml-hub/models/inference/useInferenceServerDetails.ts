import { useQuery, QueryObserverOptions } from 'react-query';
import { MLHub as API } from '@tapis/tapisui-api';
import { Models } from '@tapis/tapis-typescript';
import { useTapisConfig } from '../../../';
import QueryKeys from '../queryKeys';

const useInferenceServerDetails = (
  params: Models.DownloadModelRequest,
  options: QueryObserverOptions<
    Models.RespModelServer & Models.RespModelServerError,
    Error
  > = {}
) => {
  const { accessToken, basePath } = useTapisConfig();
  const result = useQuery<
    Models.RespModelServer & Models.RespModelServerError,
    Error
  >(
    [QueryKeys.inferenceServerDetails, params, accessToken],
    // Default to no token. This will generate a 403 when calling the list function
    // which is expected behavior for not having a token
    () =>
      API.Models.Inference.inferenceServerDetails(
        params,
        basePath,
        accessToken?.access_token ?? ''
      ),
    {
      enabled: !!accessToken,
    }
  );
  return result;
};

export default useInferenceServerDetails;
