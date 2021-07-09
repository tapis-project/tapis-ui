import { TapisState } from '../../store/rootReducer';

const getMeasurements = (state: TapisState) => state.measurements.measurements;

export default getMeasurements;
