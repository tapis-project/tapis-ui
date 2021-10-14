import React from 'react';

import styles from './Breadcrumbs.module.scss';

type BreadcrumbsProps = {
  items: Array<string>;
};

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  return (
    <div className={styles.root}>
      {items.map((item) => {
        return <span className={styles.root}>{item} / </span>;
      })}
    </div>
  );
};

export default Breadcrumbs;
