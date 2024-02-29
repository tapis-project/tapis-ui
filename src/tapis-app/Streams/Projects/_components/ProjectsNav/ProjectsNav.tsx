import React from 'react';
import { useRouteMatch } from 'react-router-dom';
import { useList } from 'tapis-hooks/streams/projects';
import { Streams } from '@tapis/tapis-typescript';
import { Navbar, NavItem } from 'tapis-ui/_wrappers/Navbar';
import { QueryWrapper } from 'tapis-ui/_wrappers';

const ProjectsNav: React.FC = () => {
  const { url } = useRouteMatch();
  // Get a projects listing with default request params
  const { data, isLoading, error } = useList();
  const definitions: Array<Streams.Project> = data?.result ?? [];
  return (
    <QueryWrapper isLoading={isLoading} error={error}>
      <Navbar>
        {definitions.length ? (
          definitions.map((project) => (
            <NavItem
              to={`${url}/${project.project_name}`}
              icon="projects"
              key={project.project_name}
            >
              {`${project.project_name}`}
            </NavItem>
          ))
        ) : (
          <i>No projects found</i>
        )}
      </Navbar>
    </QueryWrapper>
  );
};

export default ProjectsNav;
