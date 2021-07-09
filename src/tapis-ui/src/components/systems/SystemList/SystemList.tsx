import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useSystems } from 'tapis-redux';
import { TapisSystem } from '@tapis/tapis-typescript-systems';
import { LoadingSpinner } from 'tapis-ui/_common';
import { Icon } from 'tapis-ui/_common';
import { SystemsListCallback } from 'tapis-redux/systems/types';
import { Config } from 'tapis-redux/types';
import './SystemList.scss';

export type OnSelectCallback = (system: TapisSystem) => any;

interface SystemItemProps {
  system: TapisSystem,
  select: Function
  selected: boolean,
}


const SystemItem: React.FC<SystemItemProps> = ({ system, select, selected}) => {
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

SystemItem.defaultProps = {
  selected: false
}

interface SystemListProps {
  config?: Config,
  onList?: SystemsListCallback,
  onSelect?: OnSelectCallback,
  selected?: TapisSystem
}

const SystemList: React.FC<SystemListProps> = ({ config, onList, onSelect, selected }) => {
  const dispatch = useDispatch();
  const { systems, list } = useSystems(config);
  useEffect(() => {
    dispatch(list({ onList }));
  }, [dispatch]);
  const definitions: Array<TapisSystem> = systems.results;
  const select = useCallback((system: TapisSystem) => {
    onSelect(system);
  },[onSelect]);

  if (systems.loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="system-list nav flex-column">
      {
        definitions.length
          ? definitions.map(
              (system) => <SystemItem
                            key={system.id}
                            system={system}
                            //moved to props to maintain state
                            selected={selected? selected.id === system.id : false}
                            select={select}
                          />
            )
          : <i>No systems found</i>
      }
    </div>
  );
};

SystemList.defaultProps = {
  config: null,
  onList: null,
  onSelect: null
}

export default SystemList;
