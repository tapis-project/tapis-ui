import { useQuery, QueryObserverOptions } from 'react-query';
import { Pods as API } from '@tapis/tapisui-api';
import { Pods } from '@tapis/tapis-typescript';
import { useTapisConfig } from '..';
import QueryKeys from './queryKeys';

const useDetailsImages = (
  params: Pods.GetImageRequest,
  options: QueryObserverOptions<Pods.ImageResponse, Error> = {}
) => {
  const { accessToken, basePath } = useTapisConfig();
  const result = useQuery<Pods.ImageResponse, Error>(
    [QueryKeys.detailsImages, params, accessToken],
    // Default to no token. This will generate a 403 when calling the list function
    // which is expected behavior for not having a token
    () => API.detailsImages(params, basePath, accessToken?.access_token ?? ''),
    {
      enabled: !!accessToken,
    }
  );
  return result;
};

export default useDetailsImages;
