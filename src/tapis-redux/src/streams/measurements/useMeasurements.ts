import { useSelector } from 'react-redux';
import { list, select } from './actions';
import { TapisState } from '../../store/rootReducer';
import { MeasurementsListCallback } from './types';
import { Streams } from "@tapis/tapis-typescript";
import { Config } from 'tapis-redux/types';

interface MeasurementsListParams {
  onList?: MeasurementsListCallback,
  request: Streams.ListMeasurementsRequest
}

const useMeasurements = (config?: Config) => {
  const state = useSelector((state: TapisState) => state.measurements);
  return {
    state,
    list: (params: MeasurementsListParams) => {
      return list(config, params.request, params.onList)
    },
    select: (measurement: Streams.Measurement) => {
      return select(measurement);
    }
  };
};

export default useMeasurements;
