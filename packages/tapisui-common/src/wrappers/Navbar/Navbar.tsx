import React, { useRef, useCallback } from 'react';
import { NavLink } from 'react-router-dom';
import { Icon } from '../../ui';
import styles from './Navbar.module.scss';
import { ListItemButton, ListItemText } from '@mui/material';

export const NavItem: React.FC<
  React.PropsWithChildren<{
    to?: string;
    icon?: string;
    // Renders instead of the icon-font glyph named by `icon` — for cases the
    // font doesn't cover (e.g. there's no "home" glyph in it).
    iconElement?: React.ReactNode;
    secondary?: string;
    accentLeft?: boolean;
    accentLeftColor?: string;
    onLongPress?: () => void;
    longPressMs?: number;
  }>
> = ({
  to,
  icon,
  iconElement,
  children,
  secondary,
  accentLeft,
  accentLeftColor,
  onLongPress,
  longPressMs = 3000,
}) => {
  const accentStyle: React.CSSProperties = accentLeft
    ? { boxShadow: `inset 0.2rem 0 0 0 ${accentLeftColor ?? '#F69723'}` }
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
        // flexShrink: 0 guards against a parent flex column (e.g. Sidebar's
        // nav list) ever compressing this row below its natural text height —
        // harmless when the ancestor isn't flex (flexShrink is a no-op then).
        style={{ ...accentStyle, flexShrink: 0 }}
        onMouseDown={startPress}
        onMouseUp={cancelPress}
        onMouseLeave={cancelPress}
        onTouchStart={startPress}
        onTouchEnd={cancelPress}
        onClick={handleClick}
      >
        <ListItemButton style={{ paddingLeft: '1.5rem' }}>
          {iconElement ?? (icon && <Icon name={icon} />)}
          {children ? (
            <ListItemText
              className={styles['nav-text']}
              primary={children}
              secondary={secondary}
              slotProps={{
                // A line-height set on an ancestor (e.g. the .nav-text class)
                // doesn't reliably win here — MUI's Typography sets its own
                // explicit line-height from the theme, and an explicit value
                // on the element itself beats an inherited one regardless of
                // selector specificity. Setting it via sx targets the actual
                // Typography, guaranteeing enough room for descenders (g, p,
                // …) instead of the ~1.17x-font-size box DevTools showed.
                primary: { noWrap: true, sx: { lineHeight: 1.6 } },
              }}
              title={typeof children === 'string' ? children : undefined}
              style={{
                paddingRight: '.8rem',
                margin: '0',
              }}
            />
          ) : undefined}
        </ListItemButton>
      </NavLink>
    );
  } else {
    return (
      <div
        className={styles['nav-link']}
        style={{ ...accentStyle, flexShrink: 0 }}
      >
        {iconElement ?? (icon && <Icon name={icon} />)}
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
