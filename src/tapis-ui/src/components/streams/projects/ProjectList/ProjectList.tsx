import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useProjects } from 'tapis-redux';
import { Project } from "@tapis/tapis-typescript-streams";
import { ProjectsListCallback } from 'tapis-redux/streams/projects/types';
import { Config } from 'tapis-redux/types';
import { LoadingSpinner } from 'tapis-ui/_common';
import { Icon } from 'tapis-ui/_common';
import "./ProjectList.scss";

export type OnSelectCallback = (project: Project) => any;

interface ProjectItemProps {
  project: Project,
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
  selected?: Project
}

const ProjectList: React.FC<ProjectListProps> = ({ config, onList, onSelect, selected }) => {
  const dispatch = useDispatch();
  const { projects, list } = useProjects(config);
  useEffect(() => {
    dispatch(list({ onList }));
  }, [dispatch]);
  const definitions: Array<Project> = projects.results;
  const select = useCallback((project: Project) => {
    if(onSelect) {
      onSelect(project);
    }
  }, [onSelect]);

  if (projects.loading) {
    return <LoadingSpinner/>
  }

  return (
    <div className="project-list nav flex-column">
      {
        definitions.length
          ? definitions.map(
              (project) => <ProjectItem project={project} key={project.project_name} selected={selected? selected.project_name === project.project_name : false} select={select} />
            )
          : <i>No projects found</i>
      }
    </div>
  );
};

ProjectList.defaultProps = {
  config: null,
  onList: null,
  onSelect: null,
  selected: null
}

export default ProjectList;
