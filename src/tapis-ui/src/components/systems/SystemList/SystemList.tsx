import React, { useEffect, useState, useCallback } from 'react';
import { Button } from 'reactstrap';
import { useDispatch } from 'react-redux';
import { useSystems } from 'tapis-redux';
import { TapisSystem } from '@tapis/tapis-typescript-systems';
import { LoadingSpinner, Message, Icon } from 'tapis-ui/_common';
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
  className?: string
}

const SystemList: React.FC<SystemListProps> = ({ config, onList, onSelect, className }) => {
  const dispatch = useDispatch();
  const { systems, list } = useSystems(config);
  useEffect(() => {
    dispatch(list({ onList }));
  }, [dispatch]);
  const definitions: Array<TapisSystem> = systems.results;
  const [currentSystem, setCurrentSystem] = useState(String);
  const select = useCallback((system) => {
    onSelect(system);
    setCurrentSystem(system.id)
  },[onSelect, setCurrentSystem]);
  const refresh = () => {
    dispatch(list({ onList }));
    onSelect(null);
    setCurrentSystem(null)
  }

  if (!systems || systems.loading) {
    return <LoadingSpinner />
  }

  if (systems.error) {
    return <Message canDismiss={false} type="error" scope="inline">{systems.error.message}</Message>
  }

  return (
    <div>
      <Button
        type="submit"
        className="btn btn-secondary"
        disabled={systems.loading}
        onClick={() => refresh()}
      >
        <Icon name="refresh" />
      </Button>
      <div className={className ? className : "system-list nav flex-column"}>
        {
          definitions.length
            ? definitions.map(
                (system) => <SystemItem
                              system={system}
                              selected={currentSystem === system.id}
                              select={select}
                              key={system.id}
                            />
              )
            : <i>No systems found</i>
        }
      </div>
    </div>
  );
};

SystemList.defaultProps = {
  config: null,
  onList: null,
  onSelect: null
}

export default SystemList;
