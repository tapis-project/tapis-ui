import { useSelector } from 'react-redux';
import { list } from './actions';
import { TapisState } from '../../store/rootReducer';
import { ProjectsListCallback } from './types';
import * as Streams from "@tapis/tapis-typescript-streams";
import { Config } from 'tapis-redux/types';

export interface ProjectsListParams {
  onList?: ProjectsListCallback,
  request?: Streams.ListProjectsRequest
}

const useProjects = (config?: Config) => {
  const { projects } = useSelector((state: TapisState) => state.projects);
  return {
    projects,
    list: (params: ProjectsListParams) => list(config, params.onList, params.request || {}),
  };
};

export default useProjects;
