import { TapisState } from '../../store/rootReducer';

const getSites = (state: TapisState) => state.sites.sites;

export default getSites;
