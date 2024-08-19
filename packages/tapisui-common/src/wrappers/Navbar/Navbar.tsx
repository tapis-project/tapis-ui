import React from 'react';
import { NavLink } from 'react-router-dom';
import { Icon } from '../../ui';
import styles from './Navbar.module.scss';
import { ListItemButton, ListItemText } from '@mui/material';

export const NavItem: React.FC<
  React.PropsWithChildren<{ to?: string; icon?: string; secondary?: string }>
> = ({ to, icon, children, secondary }) => {
  if (to) {
    return (
      <NavLink
        to={to}
        className={styles['nav-link']}
        activeClassName={styles['active']}
        exact={to === '/'}
      >
        <ListItemButton style={{ paddingLeft: '1.5rem' }}>
          {icon && <Icon name={icon} />}
          {children ? (
            <ListItemText
              className={styles['nav-text']}
              primary={children}
              secondary={secondary}
              style={{
                paddingRight: '.8rem',
                whiteSpace: 'nowrap',
                margin: '0',
              }}
            />
          ) : undefined}
        </ListItemButton>
      </NavLink>
    );
  } else {
    return (
      <div className={styles['nav-link']}>
        {icon && <Icon name={icon} />}
        {children ? (
          <span className={styles['nav-text']}>{children}</span>
        ) : undefined}
      </div>
    );
  }
};
const Navbar: React.FC<React.PropsWithChildren> = ({ children }) => {
  return <div className={`${styles['nav-list']}`}>{children}</div>;
};

export default Navbar;
