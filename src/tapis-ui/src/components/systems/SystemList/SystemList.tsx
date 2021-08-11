import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useSystems } from 'tapis-redux/src';
import { TapisSystem } from '@tapis/tapis-typescript-systems';
import { LoadingSpinner, Message, Icon } from 'tapis-ui/src/_common';
import { SystemsListCallback } from 'tapis-redux/src/systems/types';
import { Config } from 'tapis-redux/src/types';
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
  className?: string
}

const SystemList: React.FC<SystemListProps> = ({ config, onList, onSelect, className }) => {
  const dispatch = useDispatch();
  const { systems, list } = useSystems(config);
  useEffect(() => {
    dispatch(list({ onList }));
  }, [dispatch]);
  const definitions: Array<TapisSystem | null> = systems.results;
  const [currentSystem, setCurrentSystem] = useState(String);
  const select = useCallback((system) => {
    onSelect && onSelect(system);
    setCurrentSystem(system.id)
  },[onSelect, setCurrentSystem]);

  if (!systems || systems.loading) {
    return <LoadingSpinner />
  }

  if (systems.error) {
    return <Message canDismiss={false} type="error" scope="inline">{systems.error.message}</Message>
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

SystemList.defaultProps = {
  config: undefined,
  onList: undefined,
  onSelect: undefined
}

export default SystemList;
