import React from 'react';
import { useRouteMatch } from 'react-router-dom';
import { useList } from 'tapis-hooks/systems';
import { Systems } from '@tapis/tapis-typescript';
import { Navbar, NavItem } from 'tapis-ui/_wrappers/Navbar';
import { QueryWrapper } from 'tapis-ui/_wrappers';

const SystemsNav: React.FC = () => {
  const { url } = useRouteMatch();
  // Get a systems listing with default request params
  const { data, isLoading, error } = useList();
  const definitions: Array<Systems.TapisSystem> = data?.result ?? [];

  return (
    <QueryWrapper isLoading={isLoading} error={error}>
      <Navbar>
        {definitions.length ? (
          definitions.map((system) => (
            <NavItem to={`${url}/${system.id}/`} icon="folder" key={system.id}>
              {`${system.id}`}
            </NavItem>
          ))
        ) : (
          <i>No systems found</i>
        )}
      </Navbar>
    </QueryWrapper>
  );
};

export default SystemsNav;
