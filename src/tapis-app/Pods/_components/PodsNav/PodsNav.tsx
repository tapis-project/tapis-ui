import React from 'react';
import { useRouteMatch } from 'react-router-dom';
import { useList } from 'tapis-hooks/pods';
import { Pods } from '@tapis/tapis-typescript';
import { Navbar, NavItem } from 'tapis-ui/_wrappers/Navbar';
import { QueryWrapper } from 'tapis-ui/_wrappers';

const PodsNav: React.FC = () => {
  const { url } = useRouteMatch();
  // Get a pods listing with default request params
  const { data, isLoading, error } = useList();
  const definitions: Array<Pods.PodResponse> = data?.result ?? [];

  return (
    <QueryWrapper isLoading={isLoading} error={error}>
      <Navbar>
        {definitions.length ? (
          definitions.map((system) => (
            <NavItem
              to={`${url}/${system.id}`}
              icon="visualization"
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

export default PodsNav;
