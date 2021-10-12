import { useInfiniteQuery, InfiniteQueryObserverResult } from 'react-query';
import { list } from 'tapis-api/streams/measurements';
import { Streams } from '@tapis/tapis-typescript';
import { useTapisConfig } from 'tapis-hooks';
import QueryKeys from './queryKeys';
import { concatResults, tapisNextPageParam } from './infiniteQuery';

const useList = (params: Streams.ListMeasurementsRequest) => {
  const { accessToken, basePath } = useTapisConfig();

  //limit measurements object to contain 1000 unique datetimes by default
  params.limit = params.limit ?? 1000;

  const result: InfiniteQueryObserverResult<
    Streams.RespListMeasurements,
    Error
  > = useInfiniteQuery<Streams.RespListMeasurements, Error>(
    [QueryKeys.list, params, accessToken],
    // Default to no token. This will generate a 403 when calling the list function
    // which is expected behavior for not having a token
    () => list(params, basePath, accessToken?.access_token || ''),
    {
      getNextPageParam: (lastPage, allPages) => {
        return tapisNextPageParam(lastPage, allPages, params);
      },
      enabled: !!accessToken,
    }
  );

  const concatenatedResults = result.data?.pages
    ? concatResults(result.data.pages)
    : null;

  return {
    ...result,
    concatenatedResults,
  };
};

export default useList;
