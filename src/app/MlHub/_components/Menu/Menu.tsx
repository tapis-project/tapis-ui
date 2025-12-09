import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Icon } from '@tapis/tapisui-common';
import styles from './Menu.module.scss';

const Menu: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  // Helper to check if a link is active
  const isActive = (path: string) => {
    if (path === '/ml-hub' && currentPath === '/ml-hub') return true;
    if (path !== '/ml-hub' && currentPath.startsWith(path)) return true;
    return false;
  };

  const menuItems = [
    { path: '/ml-hub', label: 'Dashboard', icon: 'dashboard', disabled: false },
    {
      path: '/ml-hub/models',
      label: 'Models',
      icon: 'simulation',
      disabled: false,
    },
  ];

  return (
    <div className={styles['menu-container']}>
      <nav className={styles['menu-nav']}>
        {menuItems.map((item) =>
          item.disabled ? (
            <span
              key={item.path}
              className={`${styles['menu-link']} ${styles['disabled']}`}
            >
              <span className={styles['icon-wrapper']}>
                <Icon name={item.icon} />
              </span>
              <span className={styles['label']}>{item.label}</span>
            </span>
          ) : (
            <NavLink
              key={item.path}
              to={item.path}
              className={styles['menu-link']}
              activeClassName={styles['active']}
              isActive={() => isActive(item.path)}
              exact={item.path === '/ml-hub'}
            >
              <span className={styles['icon-wrapper']}>
                <Icon name={item.icon} />
              </span>
              <span className={styles['label']}>{item.label}</span>
            </NavLink>
          )
        )}
      </nav>
    </div>
  );
};

export default Menu;
