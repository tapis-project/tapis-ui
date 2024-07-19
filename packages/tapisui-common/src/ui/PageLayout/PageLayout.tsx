import React from 'react';
import styles from './PageLayout.module.scss';

interface LayoutProps {
  left?: React.ReactNode;
  right?: React.ReactNode;
  top?: React.ReactNode;
  bottom?: React.ReactNode;
  constrain?: boolean;
  style?: 'standard' | 'alt';
}

const Layout: React.FC<LayoutProps> = ({
  left,
  right,
  top,
  bottom,
  constrain,
  style = 'standard',
}) => {
  return (
    <div className={styles['layout-container']}>
      <div className={styles['top']}>{top}</div>
      <div className={styles['main']}>
        <div
          className={`${styles['layout-row']} ${
            constrain ? styles.constrain : ''
          }`}
        >
          {left}
          <div className={styles['right']}>{right}</div>
        </div>
        {bottom}
      </div>
    </div>
  );
};

export default Layout;
