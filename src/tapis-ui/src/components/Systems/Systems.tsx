import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useSystems } from 'tapis-redux';
import { TapisSystem } from '@tapis/tapis-typescript-systems';
import { Config, ApiCallback, SystemsResponse } from 'tapis-redux/types';

type SystemProps = {
  definition: TapisSystem
}

const System: React.FC<SystemProps> = ({ definition }) => {
  return <div>{`${definition.id} (${definition.host})`}</div>;
};

type SystemsProps = {
  config: Config,
  onApi: ApiCallback<SystemsResponse>
}

const Systems: React.FC<SystemsProps> = ({ config, onApi }) => {
  const dispatch = useDispatch();
  const { definitions, list } = useSystems(config, onApi);
  useEffect(() => {
    dispatch(list());
  }, [dispatch]);

  return (
    <div>
      <h5>Systems</h5>
      {definitions &&
        (Object.keys(definitions).length > 0 ? (
          Object.keys(definitions).map((id) => (
            <System definition={definitions[id]} key={id} />
          ))
        ) : (
          <i>No systems found</i>
        ))}
    </div>
  );
};

export default Systems;
