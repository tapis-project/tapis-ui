import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useSystems } from 'tapis-redux';
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

const Systems = () => {
  const dispatch = useDispatch();
  const { definitions, list } = useSystems();
  useEffect(() => {
    dispatch(list());
  }, [list, dispatch]);

  return (
    <div>
      <h5>Systems</h5>
      {Object.keys(definitions).map((id) => (
        <System definition={definitions[id]} key={id} />
      ))}
    </div>
  );
};

export default Systems;
