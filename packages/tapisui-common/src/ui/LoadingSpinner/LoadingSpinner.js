import React from 'react';
import { Spinner } from 'reactstrap';
import { CircularProgress } from '@mui/material';
import PropTypes from 'prop-types';
import './LoadingSpinner.scss';

const LoadingSpinner = ({ placement, className }) => {
  return (
    <div className={`loading-icon ${className}`} data-testid="loading-spinner">
      <CircularProgress
        sx={{ color: 'grey.600' }}
        className={placement}
        color="inherit"
      />
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
