import React from 'react';
import { useRouteMatch } from 'react-router-dom';
import { Systems as Hooks } from '@tapis/tapisui-hooks';
import { Systems } from '@tapis/tapis-typescript';
import { Navbar, NavItem } from '@tapis/tapisui-common';
import { QueryWrapper } from '@tapis/tapisui-common';

const SystemsNav: React.FC = () => {
  const { url } = useRouteMatch();
  // Get a systems listing with default request params
  const { data, isLoading, error } = Hooks.useList();
  const definitions: Array<Systems.TapisSystem> = data?.result ?? [];

  return (
    <QueryWrapper isLoading={isLoading} error={error}>
      <Navbar>
        {definitions.length ? (
          definitions.map((system) => (
            <NavItem
              to={`${url}/${system.id}`}
              icon="data-files"
              key={system.id}
            >
              {`${system.id} (${system.host})`}
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
