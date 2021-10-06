import { Streams } from '@tapis/tapis-typescript';

////////////////////////////
//custom infiniteQuery ops//
////////////////////////////

export const tapisNextPageParam = (
  lastPage: Streams.RespListMeasurements,
  allPages: Streams.RespListMeasurements[],
  params: { limit?: number }
) => {
  const measurements: Streams.Measurements | null = lastPage.result ?? null;
  //get number of results
  let results = 0;
  if (measurements) {
    //deconstruct to standard props and props referencing streams variables
    const { instrument, site, measurements_in_file, ...variableProps } =
      measurements;
    for (let variable in variableProps) {
      //get variable measurements
      let variableMeasurements: { [datetime: string]: number } =
        measurements[variable];
      results += Object.keys(variableMeasurements).length;
    }
  }
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
  //measurements_in_file is a representation of the number of unique datetimes not the total measurements
  //store datetimes in a set for uniqueness
  let datetimes = new Set<string>();

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

            //add datetimes to store
            for (let datetime in variableMeasurements) {
              datetimes.add(datetime);
            }

            //get variable measurements from accumulator
            let accVariableMeasurements = acc[variable];
            //combine objects if accumulator already has a reference to this variable
            //otherwise just add new variable measurements to accumulator
            acc[variable] = accVariableMeasurements
              ? {
                  ...accVariableMeasurements,
                  ...variableMeasurements,
                }
              : variableMeasurements;
          }
        }
        //otherwise return measurements
        else {
          //still need to get datetimes
          for (let variable in variableProps) {
            //add datetimes to store
            for (let datetime in measurements[variable]) {
              datetimes.add(datetime);
            }
          }
          //set next to measurements
          next = measurements;
        }
      }
      return next;
    },
    null
  );

  //set measurements_in_file to the number of unique datetimes
  if (reduced) {
    reduced.measurements_in_file = datetimes.size;
  }

  return reduced;
};
