import React from 'react';
import PropTypes from 'prop-types';
import './Pill.module.scss';

function Pill({ children, type, className }) {
  const pillStyleName = `root is-${type}`;

  return (
    <span styleName={pillStyleName} className={className}>
      {children}
    </span>
  );
}

Pill.propTypes = {
  children: PropTypes.string.isRequired,
  type: PropTypes.string,
  className: PropTypes.string
};

Pill.defaultProps = {
  type: 'normal',
  className: ''
};

export default Pill;
