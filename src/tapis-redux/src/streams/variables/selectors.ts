import { TapisState } from '../../store/rootReducer';

const getVariables = (state: TapisState) => state.variables.variables;

export default getVariables;
