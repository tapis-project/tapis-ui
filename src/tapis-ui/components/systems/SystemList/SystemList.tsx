import React from 'react';
import { NavLink, useRouteMatch } from 'react-router-dom';
import { useList } from 'tapis-hooks/systems';
import { Systems } from '@tapis/tapis-typescript';
import { LoadingSpinner, Message, Icon } from 'tapis-ui/_common';
import './SystemList.scss';

export type OnSelectCallback = (system: Systems.TapisSystem) => any;

interface SystemItemProps {
  system: Systems.TapisSystem,
}


const SystemItem: React.FC<SystemItemProps> = ({ system }) => {
  const { url } = useRouteMatch();
  return (
    <li className="nav-item">
      <NavLink to={`${url}/${system.id}`} className={"nav-link"} activeClassName={"active"}>
        <div className="nav-content">
          <Icon name="data-files" />
          <span className="nav-text">{`${system.id} (${system.host})`}</span>
        </div>
      </NavLink>
    </li>
  );
};

interface SystemListProps {
  className?: string,
}

const SystemList: React.FC<SystemListProps> = ({ className=null }) => {

  // Get a systems listing with default request params
  const { data, isLoading, error } = useList();

  const definitions: Array<Systems.TapisSystem> = data?.result || [];

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (error) {
    return <Message canDismiss={false} type="error" scope="inline">{error.message}</Message>
  }

  return (
    <div className={className ? className : "system-list nav flex-column"}>
      {
        definitions.length
          ? definitions.map(
              (system) => system && <SystemItem
                            system={system}
                            key={system.id}
                          />
            )
          : <i>No systems found</i>
      }
    </div>
  );
};

export default SystemList;
