import { useSelector } from 'react-redux';
import { list } from './actions';
import { TapisState } from '../../store/rootReducer';
import { MeasurementsListCallback } from './types';
import { Streams } from "@tapis/tapis-typescript";
import { Config } from 'tapis-redux/types';

interface MeasurementsListParams {
  onList?: MeasurementsListCallback,
  request: Streams.ListMeasurementsRequest
}

const useMeasurements = (config?: Config) => {
  const { measurements } = useSelector((state: TapisState) => state.measurements);
  return {
    measurements,
    list: (params: MeasurementsListParams) => list(config, params.request, params.onList),
  };
};

export default useMeasurements;
