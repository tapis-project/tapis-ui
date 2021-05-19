import React from 'react';
import { Spinner } from 'reactstrap';
import PropTypes from 'prop-types';
import './LoadingSpinner.scss';

const LoadingSpinner = ({ placement, className }) => {
  return (
    <div className={`loading-icon ${className}`} data-testid="loading-spinner">
      <Spinner className={placement} />
    </div>
  );
};
LoadingSpinner.propTypes = {
  placement: PropTypes.string,
  className: PropTypes.string,
};
LoadingSpinner.defaultProps = {
  placement: 'section',
  className: '',
};

export default LoadingSpinner;
