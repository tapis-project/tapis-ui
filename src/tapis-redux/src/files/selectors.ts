import { TapisState } from '../store/rootReducer';



const getSystems = (state: TapisState) => state.systems.definitions;

export default getSystems;
