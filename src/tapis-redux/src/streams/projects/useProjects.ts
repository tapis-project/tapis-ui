import { useSelector } from 'react-redux';
import { list } from './actions';
import { TapisState } from '../../store/rootReducer';
import { ProjectsListCallback } from './types';
import * as Streams from "@tapis/tapis-typescript-streams";

interface ProjectsListParams {
  onList?: ProjectsListCallback
}

const useProjects = (config) => {
  const { projects } = useSelector((state: TapisState) => state.projects);
  return {
    projects,
    list: (params: ProjectsListParams & Streams.ListProjectsRequest) => list(config, params.onList),
  };
};

export default useProjects;
