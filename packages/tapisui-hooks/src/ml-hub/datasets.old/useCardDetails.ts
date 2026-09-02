import { useQuery, QueryObserverOptions } from 'react-query';
import { MLHub as API } from '@tapis/tapisui-api';
import { Datasets } from '@tapis/tapis-typescript';
import { useTapisConfig } from '../../';
import QueryKeys from './queryKeys';

const useCardDetails = (
  params: Datasets.GetDatasetCardRequest,
  options: QueryObserverOptions<Datasets.RespDatasetCard, Error> = {}
) => {
  const { accessToken, basePath } = useTapisConfig();
  const result = useQuery<Datasets.RespDatasetCard, Error>(
    [QueryKeys.details, params, accessToken],
    // Default to no token. This will generate a 403 when calling the list function
    // which is expected behavior for not having a token
    () =>
      API.Datasets.cardDetails(
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

export default useCardDetails;
