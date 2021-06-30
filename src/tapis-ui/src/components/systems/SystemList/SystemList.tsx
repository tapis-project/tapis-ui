import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useSystems } from 'tapis-redux';
import { TapisSystem } from '@tapis/tapis-typescript-systems';
import { LoadingSpinner } from 'tapis-ui/_common';
import { Icon } from 'tapis-ui/_common';
import { SystemsListCallback } from 'tapis-redux/systems/types';
import { Config } from 'tapis-redux/types';
import './SystemList.scss';
// import { select } from 'redux-saga/effects';

export type OnSelectCallback = (system: TapisSystem) => any;

interface SystemItemProps {
  system: TapisSystem,
  onSelect?: OnSelectCallback
  isSelected: String,
  setIsSelected: Function,
}


const SystemItem: React.FC<SystemItemProps> = ({ system, onSelect, isSelected, setIsSelected }) => {
  const select = () => {
    setIsSelected(system.id)
    onSelect(system)
  };
  return (
    <li className="nav-item">
      {/* placeholder selection until I can figure out a way of doing this */}
      <button className={"nav-link" + (system.id == isSelected ? ' active' : '')}>
        <div className="nav-content" onClick={() => select() }>
          <Icon name="data-files" />
          <span className="nav-text">{`${system.id} (${system.host})`}</span>
        </div>
      </button>
    </li>
  );
};

SystemItem.defaultProps = {
  onSelect: null
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
  const [isSelected, setIsSelected] = useState('');

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
                            onSelect={onSelect}
                            isSelected={isSelected}
                            setIsSelected={setIsSelected}
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
