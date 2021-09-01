import React from 'react';
import PropTypes from 'prop-types';
import styles from './Pill.module.scss';

function Pill({ children, type, className, shouldTruncate }) {
  let pillStyleName = `root is-${type}`;

  if (shouldTruncate) pillStyleName += ' should-truncate';

  return (
    <span className={`${styles[pillStyleName]} ${className}`}>{children}</span>
  );
}

Pill.propTypes = {
  children: PropTypes.string.isRequired,
  type: PropTypes.string,
  className: PropTypes.string,
  shouldTruncate: PropTypes.bool,
};

Pill.defaultProps = {
  type: 'normal',
  className: '',
  shouldTruncate: true,
};

export default Pill;
