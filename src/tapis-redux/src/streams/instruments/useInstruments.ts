import { useSelector } from 'react-redux';
import { list, select } from './actions';
import { TapisState } from '../../store/rootReducer';
import { InstrumentsListCallback } from './types';
import { Streams } from "@tapis/tapis-typescript";
import { Config } from 'tapis-redux/types';

interface InstrumentsListParams {
  onList?: InstrumentsListCallback,
  request: Streams.ListInstrumentsRequest
}

const useInstruments = (config?: Config) => {
  const state = useSelector((state: TapisState) => state.instruments);
  return {
    state,
    list: (params: InstrumentsListParams) => {
      return list(config, params.request, params.onList)
    },
    select: (instrument: Streams.Instrument) => {
      return select(instrument);
    }
  };
};

export default useInstruments;
