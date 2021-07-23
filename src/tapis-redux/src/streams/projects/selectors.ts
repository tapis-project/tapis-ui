import { TapisState } from '../../store/rootReducer';

const getProjects = (state: TapisState) => state.projects.projects;

export default getProjects;
