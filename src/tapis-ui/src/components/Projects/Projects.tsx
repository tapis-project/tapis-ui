import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useProjects } from 'tapis-redux';
import { Project } from "@tapis/tapis-typescript-streams";
import { ProjectsListCallback } from 'tapis-redux/streams/projects/types';
import { Config } from 'tapis-redux/types';

export type OnSelectCallback = (project: Project) => any;

interface ProjectItemProps {
  project: Project,
  onSelect?: OnSelectCallback
}

const ProjectItem: React.FC<ProjectItemProps> = ({ project, onSelect }) => {
  return (
    <div onClick={() => onSelect(project)}>
      {`${project.project_uuid} (${project.project_name})`}
    </div>
  );
};

ProjectItem.defaultProps = {
  onSelect: null
}

interface ProjectsProps {
  config?: Config,
  onList?: ProjectsListCallback,
  onSelect?: OnSelectCallback
}

const Projects: React.FC<ProjectsProps> = ({ config, onList, onSelect }) => {
  const dispatch = useDispatch();
  const { projects, list } = useProjects(config);
  useEffect(() => {
    dispatch(list({ onList }));
  }, [dispatch]);

  const definitions: Array<Project> = projects.results;

  if (projects.loading) {
    return <div>Loading</div>
  }

  return (
    <div>
      <h5>Projects</h5>
      {
        definitions.length
          ? definitions.map(
              (project) => <ProjectItem project={project} key={project.project_name} onSelect={onSelect} />
            )
          : <i>No projects found</i>
  
      }
    </div>
  );
};

Projects.defaultProps = {
  config: null,
  onList: null,
  onSelect: null
}

export default Projects;
