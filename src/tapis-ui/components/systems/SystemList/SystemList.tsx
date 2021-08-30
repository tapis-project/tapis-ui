import React from 'react';
import { useRouteMatch } from 'react-router-dom';
import { useList } from 'tapis-hooks/systems';
import { Systems } from '@tapis/tapis-typescript';
import { LoadingSpinner, Message } from 'tapis-ui/_common';
import { Navbar, NavItem } from 'tapis-ui/components/Navbar';

const SystemList: React.FC = () => {
  const { url } = useRouteMatch();
  // Get a systems listing with default request params
  const { data, isLoading, error } = useList();

  const definitions: Array<Systems.TapisSystem> = data?.result || [];

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <Message canDismiss={false} type="error" scope="inline">
        {error.message}
      </Message>
    );
  }

  return (
    <Navbar>
      {definitions.length ? (
        definitions.map(
          system =>
            system && (
              <NavItem
                to={`${url}/${system.id}`}
                icon="data-files"
                key={system.id}
              >{`${system.id} (${system.host})`}</NavItem>
            )
        )
      ) : (
        <i>No systems found</i>
      )}
    </Navbar>
  );
};

export default SystemList;
