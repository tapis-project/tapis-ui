import React, { useState, useCallback } from 'react';
import { useList } from 'tapis-hooks/systems';
import { Systems } from '@tapis/tapis-typescript';
import { LoadingSpinner, Message, Icon } from 'tapis-ui/_common';
import './SystemList.scss';

export type OnSelectCallback = (system: Systems.TapisSystem) => any;

interface SystemItemProps {
  system: Systems.TapisSystem,
  select: Function
  selected: boolean,
}


const SystemItem: React.FC<SystemItemProps> = ({ system, select, selected = false}) => {
  return (
    <li className="nav-item">
      <div className={"nav-link" + (selected ? ' active' : '')}>
        <div className="nav-content" onClick={() => select(system) }>
          <Icon name="data-files" />
          <span className="nav-text">{`${system.id} (${system.host})`}</span>
        </div>
      </div>
    </li>
  );
};

interface SystemListProps {
  onSelect?: OnSelectCallback | null,
  className?: string,
}

const SystemList: React.FC<SystemListProps> = ({ onSelect=null, className=null }) => {

  // Get a systems listing with default request params
  const { data, isLoading, error } = useList();

  const definitions: Array<Systems.TapisSystem> = data?.result || [];
  const [currentSystem, setCurrentSystem] = useState(String);
  const select = useCallback((system) => {
    onSelect && onSelect(system);
    setCurrentSystem(system.id)
  },[onSelect, setCurrentSystem]);

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
                            selected={currentSystem === system.id}
                            select={select}
                            key={system.id}
                          />
            )
          : <i>No systems found</i>
      }
    </div>
  );
};

export default SystemList;
