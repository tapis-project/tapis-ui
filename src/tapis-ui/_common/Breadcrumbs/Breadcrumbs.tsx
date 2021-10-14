import React from 'react';

import { NavItem } from 'reactstrap';
import styles from './Breadcrumbs.module.scss';

type BreadcrumbsProps = {
  items: Array<string | NavItem>;
};

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  return (
    <div className={styles.root}>
      Files /
      {items.map((item) => {
        return <span> {item} /</span>;
      })}
    </div>
  );
};

export default Breadcrumbs;
