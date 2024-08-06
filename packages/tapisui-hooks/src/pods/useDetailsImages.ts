import { useQuery, QueryObserverOptions, useQueryClient } from 'react-query';
import { Pods as API } from '@tapis/tapisui-api';
import { Pods } from '@tapis/tapis-typescript';
import { useTapisConfig } from '..';
import QueryKeys from './queryKeys';

const useDetailsImages = (
  params: Pods.GetImageRequest,
  options: QueryObserverOptions<Pods.ImageResponse, Error> = {}
) => {
  const queryClient = useQueryClient(); // Get the queryClient instance
  const { accessToken, basePath } = useTapisConfig();
  const result = useQuery<Pods.ImageResponse, Error>(
    [QueryKeys.detailsImages, params, accessToken],
    () => API.detailsImages(params, basePath, accessToken?.access_token ?? ''),
    {
      ...options,
      enabled: !!accessToken,
    }
  );

  const invalidate = () => {
    queryClient.invalidateQueries([QueryKeys.detailsImages]);
  };

  return { ...result, invalidate };
};

export default useDetailsImages;
