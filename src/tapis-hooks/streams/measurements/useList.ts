import { useInfiniteQuery, InfiniteQueryObserverResult } from 'react-query';
import { list } from 'tapis-api/streams/measurements';
import { Streams } from '@tapis/tapis-typescript';
import { useTapisConfig } from 'tapis-hooks';
import QueryKeys from './queryKeys';
import { tapisNextPageParam } from 'tapis-hooks/utils/infiniteQuery';

const useList = (params: Streams.ListMeasurementsRequest) => {
  const { accessToken, basePath } = useTapisConfig();

  //limit measurements object to contain 100 measurements by default
  params.limit = params.limit ?? 100;

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
        return tapisNextPageParam<Streams.RespListMeasurements>(
          lastPage,
          allPages,
          params
        );
      },
      enabled: !!accessToken,
    }
  );

  //Concatenate a set of Measurements objects from the same instrument
  const concatResults = (
    pages: Streams.RespListMeasurements[]
  ): Streams.Measurements | null => {
    //non data measurement properties
    const nonDataProps = ['instrument', 'site', 'measurements_in_file'];

    //measurements_in_file is a representation of the number of unique datetimes not the total measurements
    //store datetimes in a set for uniqueness
    let datetimes = new Set<string>();

    //reduce to a single Measurements object
    let reduced: Streams.Measurements | null = pages.reduce(
      (
        acc: Streams.Measurements | null,
        item: Streams.RespListMeasurements
      ) => {
        let measurements: Streams.Measurements | null = item.result ?? null;
        //if accumulator is not null add new measurements to accumulator
        if (acc) {
          for (let prop in measurements) {
            //check if property is a variable field
            if (!nonDataProps.includes(prop)) {
              //get new variable measurements
              let variableMeasurements: { [datetime: string]: number } =
                measurements[prop];

              //add datetimes to store
              for (let datetime in variableMeasurements) {
                datetimes.add(datetime);
              }

              //get variable measurements from accumulator
              let accVariableMeasurements = acc[prop];
              //combine objects if accumulator already has a reference to this variable
              //otherwise just add new variable measurements to accumulator
              acc[prop] = accVariableMeasurements
                ? {
                    ...accVariableMeasurements,
                    ...variableMeasurements,
                  }
                : variableMeasurements;
            }
          }
          //measurements in file is uniques datetimes?

          //return updated accumulator
          return acc;
        }
        //otherwise return measurements
        else {
          //still need to get datetimes
          for (let prop in measurements) {
            //check if property is a variable field
            if (!nonDataProps.includes(prop)) {
              //add datetimes to store
              for (let datetime in measurements[prop]) {
                datetimes.add(datetime);
              }
            }
          }

          return measurements;
        }
      },
      null
    );

    //set measurements_in_file to the number of unique datetimes
    if (reduced) {
      reduced.measurements_in_file = datetimes.size;
    }

    return reduced;
  };

  const concatenatedResults = result.data?.pages
    ? concatResults(result.data.pages)
    : null;

  return {
    ...result,
    concatenatedResults,
  };
};

export default useList;
