import React from 'react';
import styles from './PageLayout.module.scss';

interface LayoutProps {
  left?: React.ReactNode;
  right?: React.ReactNode;
  top?: React.ReactNode;
  bottom?: React.ReactNode;
}
const Layout: React.FC<LayoutProps> = ({ left, right, top, bottom }) => (
  <div className={styles['layout-root']}>
    {top}
    <div className={styles['layout-row']}>
      {left}
      {right}
    </div>
    {bottom}
  </div>
);

export default Layout;
