import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useSystems } from 'tapis-redux';
import { TapisSystem } from '@tapis/tapis-typescript-systems';
import { SystemsListCallback } from 'tapis-redux/systems/types';
import { Config } from 'tapis-redux/types';

export type OnSelectCallback = (system: TapisSystem) => any;

interface SystemItemProps {
  system: TapisSystem,
  onSelect?: OnSelectCallback
}

const SystemItem: React.FC<SystemItemProps> = ({ system, onSelect }) => {
  return (
    <div onClick={() => onSelect(system)}>
      {`${system.id} (${system.host})`}
    </div>
  );
};

SystemItem.defaultProps = {
  onSelect: null
}

interface SystemsProps {
  config?: Config,
  onList?: SystemsListCallback,
  onSelect?: OnSelectCallback
}

const Systems: React.FC<SystemsProps> = ({ config, onList, onSelect }) => {
  const dispatch = useDispatch();
  const { definitions, list } = useSystems(config);
  useEffect(() => {
    dispatch(list(onList));
  }, [dispatch]);

  return (
    <div>
      <h5>Systems</h5>
      {definitions &&
        (Object.keys(definitions).length > 0 ? (
          Object.keys(definitions).map((id) => (
            <SystemItem system={definitions[id]} key={id} onSelect={onSelect} />
          ))
        ) : (
          <i>No systems found</i>
        ))}
    </div>
  );
};

Systems.defaultProps = {
  config: null,
  onList: null,
  onSelect: null
}

export default Systems;
