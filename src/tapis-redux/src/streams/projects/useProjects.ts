import { useSelector } from 'react-redux';
import { list, select } from './actions';
import { TapisState } from '../../store/rootReducer';
import { ProjectsListCallback } from './types';
import { Streams } from "@tapis/tapis-typescript";
import { Config } from 'tapis-redux/types';

export interface ProjectsListParams {
  onList?: ProjectsListCallback,
  request?: Streams.ListProjectsRequest
}

const useProjects = (config?: Config) => {
  const state = useSelector((state: TapisState) => state.projects);
  return {
    state,
    list: (params: ProjectsListParams) => {
      return list(config, params.onList, params.request)
    },
    select: (project: Streams.Project) => {
      return select(project);
    }
  };
};

export default useProjects;
