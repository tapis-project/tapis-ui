import React from 'react';
import styles from './PortalPageLayout.module.scss';

type PortalPageLayoutProps = {
  title: string;
  subtitleLines?: string[];
  children: React.ReactNode;
};

const PortalPageLayout: React.FC<PortalPageLayoutProps> = ({
  title,
  subtitleLines,
  children,
}) => {
  return (
    <div className={styles.page}>
      <div className={styles.banner}>
        <div className={styles.bannerInner}>
          <div className={styles.bannerTitle}>{title}</div>
          {subtitleLines?.map((line) => (
            <div className={styles.bannerSubtitle} key={line}>
              {line}
            </div>
          ))}
        </div>
      </div>
      <div className={styles.content}>{children}</div>
    </div>
  );
};

export default PortalPageLayout;
