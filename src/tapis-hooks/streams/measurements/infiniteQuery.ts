import { Streams } from '@tapis/tapis-typescript';

////////////////////////////
//custom infiniteQuery ops//
////////////////////////////

export const tapisNextPageParam = (
  lastPage: Streams.RespListMeasurements,
  allPages: Streams.RespListMeasurements[],
  params: { limit?: number }
) => {
  //limit represents the maximum number of unique datetimes in the measurements object and measurements_in_file represents the number of unique datetimes,
  //so this will work for the number of results check
  const results: number = lastPage.result?.measurements_in_file ?? 0;
  
  return results < params.limit!
    ? undefined
    : {
        ...params,
        offset: allPages.length * params.limit!,
      };
};

//Concatenate a set of Measurements objects from the same instrument
export const concatResults = (
  pages: Streams.RespListMeasurements[]
): Streams.Measurements | null => {
  //measurements_in_file is a representation of the number of unique datetimes

  //reduce to a single Measurements object
  let reduced: Streams.Measurements | null = pages.reduce(
    (acc: Streams.Measurements | null, item: Streams.RespListMeasurements) => {
      //set next to acc
      let next = acc;
      const measurements: Streams.Measurements | null = item.result ?? null;
      //if measurements is null just return acc
      if (measurements) {
        //deconstruct to standard props and props referencing streams variables
        const { instrument, site, measurements_in_file, ...variableProps } =
          measurements;

        //if accumulator is not null add new measurements to accumulator
        if (acc) {
          for (let variable in variableProps) {
            //get new variable measurements
            let variableMeasurements: { [datetime: string]: number } =
              measurements[variable];

            //combine objects if accumulator already has a reference to this variable
            acc[variable] = {
                  ...acc[variable],
                  ...variableMeasurements,
                };
          }
          //measurements_in_file should always be defined in returned measurements
          acc.measurements_in_file! += measurements_in_file!;
        }
        //otherwise return measurements
        else {
          //set next to measurements
          next = measurements;
        }
      }
      return next;
    },
    null
  );

  return reduced;
};
