import { TapisState } from '../store/rootReducer';

const getSystems = (state: TapisState) => state.systems.systems;

export default getSystems;
