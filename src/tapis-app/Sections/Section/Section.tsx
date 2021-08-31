import React from 'react';
import { SectionHeader as CommonSectionHeader } from 'tapis-ui/_common';
import styles from './Section.module.scss';

export const SectionHeader: React.FC<
  React.PropsWithChildren<{ type?: string }>
> = ({ children, type }) => {
  return (
    <div className={type && styles[type]}>
      <CommonSectionHeader>{children}</CommonSectionHeader>
    </div>
  );
};

export const SectionNavWrapper: React.FC<React.PropsWithChildren<{}>> = ({
  children
}) => {
  return <div className={styles.list}>{children}</div>;
};

export const SectionBody: React.FC<React.PropsWithChildren<{}>> = ({
  children
}) => {
  return (
    <div className={styles.body}>
      <div className={styles.detail}>{children}</div>
    </div>
  );
};
