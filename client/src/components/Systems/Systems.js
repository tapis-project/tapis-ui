import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useSystems } from 'tapis-redux';
import { configPropType, defaultConfig } from 'tapis-redux/types';
import PropTypes from 'prop-types';

const System = ({ definition }) => {
  return <div>{`${definition.id} (${definition.host})`}</div>;
};

System.propTypes = {
  definition: PropTypes.shape({
    id: PropTypes.string.isRequired,
    host: PropTypes.string.isRequired,
  }).isRequired,
};

const Systems = ({ config, onApi }) => {
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

Systems.propTypes = {
  config: configPropType,
  onApi: PropTypes.func,
};

Systems.defaultProps = {
  config: defaultConfig,
  onApi: null,
};

export default Systems;
