import { TapisState } from '../../store/rootReducer';

const getInstruments = (state: TapisState) => state.instruments.instruments;

export default getInstruments;
