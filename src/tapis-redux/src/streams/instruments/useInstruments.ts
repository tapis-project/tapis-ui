import { useSelector } from 'react-redux';
import { list } from './actions';
import { TapisState } from '../../store/rootReducer';
import { InstrumentsListCallback } from './types';
import { Streams } from "@tapis/tapis-typescript";
import { Config } from 'tapis-redux/types';

interface InstrumentsListParams {
  onList?: InstrumentsListCallback,
  request: Streams.ListInstrumentsRequest
}

const useInstruments = (config?: Config) => {
  const { instruments } = useSelector((state: TapisState) => state.instruments);
  return {
    instruments,
    list: (params: InstrumentsListParams) => list(config, params.request, params.onList),
  };
};

export default useInstruments;
