import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useStreams } from 'tapis-redux';
import { configPropType, defaultConfig } from 'tapis-redux/types';
import PropTypes from 'prop-types';

const Stream = ({ definition }) => {
  return <div>{`${definition.id} (${definition.host})`}</div>;
};

Stream.propTypes = {
  definition: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired,
};

const Streams = ({ config, onApi }) => {
  const dispatch = useDispatch();
  const { definitions, list } = useStreams(config, onApi);
  useEffect(() => {
    dispatch(list());
  }, [dispatch]);

  return (
    <div>
      <h5>Stream Projects</h5>
      {definitions &&
        (Object.keys(definitions).length > 0 ? (
          Object.keys(definitions).map((id) => (
            <Stream definition={definitions[id]} key={id} />
          ))
        ) : (
          <i>No streams found</i>
        ))}
    </div>
  );
};

Streams.propTypes = {
  config: configPropType,
  onApi: PropTypes.func,
};

Streams.defaultProps = {
  config: defaultConfig,
  onApi: null,
};

export default Streams;
