import React from 'react';
import PropTypes from 'prop-types';
import './Icon.module.css';

const Icon = ({ children = '', className = '', name }) => {
  const iconClassName = `icon icon-${name}`;
  // FAQ: The conditional avoids an extra space in class attribute value
  const fullClassName = className
    ? [className, iconClassName].join(' ')
    : iconClassName;
  const label = children;

  return <i className={fullClassName} role="img" aria-label={label} />;
};
Icon.propTypes = {
  /** A text alternative to the icon (for accessibility) */
  children: PropTypes.string,
  /** Additional className for the root element */
  className: PropTypes.string,
  /** Name of icon from icon font (without the (`icon-` prefix) */
  name: PropTypes.string.isRequired,
};

export default Icon;
