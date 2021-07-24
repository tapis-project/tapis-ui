import { Streams } from '@tapis/tapis-typescript';
import { TapisState } from '../../store/rootReducer';
import { ProjectList } from './types';

type getListingSelectorType = (state: TapisState) => ProjectList;

export const getProjects = (): getListingSelectorType => {
    return (state: TapisState): ProjectList => {
        return state.projects.projects;
    };
};


