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
  currentSystem: string,
  select: Function,
}


const SystemItem: React.FC<SystemItemProps> = ({ system, currentSystem, select}) => {
  return (
    <li className="nav-item">
      <button className={"nav-link" + (system.id == currentSystem ? ' active' : '')}>
        <div className="nav-content" onClick={() => select(system) }>
          <Icon name="data-files" />
          <span className="nav-text">{`${system.id} (${system.host})`}</span>
        </div>
      </button>
    </li>
  );
};

SystemItem.defaultProps = {
  currentSystem: null
}

interface SystemListProps {
  config?: Config,
  onList?: SystemsListCallback,
  onSelect?: OnSelectCallback
}

const SystemList: React.FC<SystemListProps> = ({ config, onList, onSelect }) => {
  const dispatch = useDispatch();
  const { systems, list } = useSystems(config);
  useEffect(() => {
    dispatch(list({ onList }));
  }, [dispatch]);
  const definitions: Array<TapisSystem> = systems.results;
  const [currentSystem, setCurrentSystem] = useState(String);

  if (systems.loading) {
    return <LoadingSpinner />
  }

  const select = useCallback((system) => {
    onSelect(system);
    setCurrentSystem(system.id)
  },[]);

  if (systems.loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="system-list nav flex-column">
      {
        definitions.length
          ? definitions.map(
              (system) => <SystemItem
                            system={system}
                            key={system.id}
                            currentSystem={currentSystem}
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
