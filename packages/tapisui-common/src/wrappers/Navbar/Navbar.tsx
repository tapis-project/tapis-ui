import React, { useRef, useCallback } from 'react';
import { NavLink } from 'react-router-dom';
import { Icon } from '../../ui';
import styles from './Navbar.module.scss';
import { ListItemButton, ListItemText } from '@mui/material';

export const NavItem: React.FC<
  React.PropsWithChildren<{
    to?: string;
    icon?: string;
    secondary?: string;
    accentLeft?: boolean;
    accentLeftColor?: string;
    onLongPress?: () => void;
    longPressMs?: number;
  }>
> = ({
  to,
  icon,
  children,
  secondary,
  accentLeft,
  accentLeftColor,
  onLongPress,
  longPressMs = 3000,
}) => {
  const accentStyle: React.CSSProperties = accentLeft
    ? { borderLeft: `.4rem solid ${accentLeftColor ?? '#F69723'}` }
    : {};

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didLongPress = useRef(false);

  const startPress = useCallback(() => {
    didLongPress.current = false;
    if (onLongPress) {
      timerRef.current = setTimeout(() => {
        didLongPress.current = true;
        onLongPress();
      }, longPressMs);
    }
  }, [onLongPress, longPressMs]);

  const cancelPress = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (didLongPress.current) {
      e.preventDefault();
      didLongPress.current = false;
    }
  }, []);

  if (to) {
    return (
      <NavLink
        to={to}
        className={styles['nav-link']}
        activeClassName={styles['active']}
        exact={to === '/'}
        style={accentStyle}
        onMouseDown={startPress}
        onMouseUp={cancelPress}
        onMouseLeave={cancelPress}
        onTouchStart={startPress}
        onTouchEnd={cancelPress}
        onClick={handleClick}
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
      <div className={styles['nav-link']} style={accentStyle}>
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
