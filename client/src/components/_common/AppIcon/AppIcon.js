import React from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import Icon from '../Icon';
import './AppIcon.scss';

const AppIcon = ({ appId }) => {
  const appIcons = useSelector(state => state.apps.appIcons);
  const findAppIcon = id => {
    let appIcon = 'applications';
    Object.keys(appIcons).forEach(appName => {
      if (id.includes(appName)) {
        appIcon = appIcons[appName].toLowerCase();
      }
    });
    return appIcon;
  };
  const iconName = findAppIcon(appId);

  return <Icon name={iconName} />;
};
AppIcon.propTypes = {
  appId: PropTypes.string.isRequired
};

export default AppIcon;
