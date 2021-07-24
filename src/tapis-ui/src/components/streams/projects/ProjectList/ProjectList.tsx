import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useProjects } from 'tapis-redux';
import { Streams } from "@tapis/tapis-typescript";
import { ProjectList, ProjectsListCallback, ProjectsReducerState } from 'tapis-redux/streams/projects/types';
import { Config, TapisState } from 'tapis-redux/types';
import { LoadingSpinner } from 'tapis-ui/_common';
import { Icon } from 'tapis-ui/_common';
import "./ProjectList.scss";
import { getProjects } from 'tapis-redux/streams/projects/selectors';

export type OnSelectCallback = (project: Streams.Project) => any;

interface ProjectItemProps {
  project: Streams.Project,
  select: Function,
  selected: boolean
}

const ProjectItem: React.FC<ProjectItemProps> = ({ project, select, selected }) => {
  return (

    <li className="nav-item">
      <div className={"nav-link" + (selected ? ' active' : '')}>
        <div className="nav-content" onClick={() => select(project) }>
          <Icon name="data-files" />
          <span className="nav-text">{`${project.project_name}`}</span>
        </div>
      </div>
    </li>



    // <div onClick={() => onSelect(project)}>
    //   {`${project.project_uuid} (${project.project_name})`}
    // </div>
  );
};

ProjectItem.defaultProps = {
  selected: false
}

interface ProjectListProps {
  config?: Config,
  onList?: ProjectsListCallback,
  onSelect?: OnSelectCallback,
}

const ProjectList: React.FC<ProjectListProps> = ({ config, onList, onSelect }) => {
  const dispatch = useDispatch();
  const { state, list } = useProjects(config);
  useEffect(() => {
    //if projects list isn't empty don't re-request
    if(state.projects.results.length < 1) {
      dispatch(list({
        onList
      }));
    }
  }, [dispatch, state, onList]);

  dispatch({
    type: "test",
    payload: "id"
  });

  const select = useCallback((project: Streams.Project) => {
    if(onSelect) {
      onSelect(project);
    }
  }, [onSelect]);


  const selector = getProjects();
  const result: ProjectList = useSelector<TapisState, ProjectList>(selector); 

  if(!result || result.loading) {
    return <LoadingSpinner/>
  }

  let definitions = result.results;

  return (
    <div className="project-list nav flex-column">
      {
        definitions.length
          ? definitions.map(
              (project) => <ProjectItem project={project} key={project.project_name} selected={state.selected? state.selected.project_name === project.project_name : false} select={select} />
            )
          : <i>No projects found</i>
      }
    </div>
  );
};

// ProjectList.defaultProps = {
//   config: null,
//   onList: null,
//   onSelect: null,
//   selected: null
// }

export default ProjectList;
