import React from 'react';

import { range } from 'tapis-ui/utils/range';
import { NavLink } from 'react-router-dom';
import styles from './Breadcrumbs.module.scss';

export type BreadcrumbType = {
  to: string;
  text: string;
};

type BreadcrumbsProps = {
  breadcrumbs: Array<BreadcrumbType>;
};

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ breadcrumbs }) => {
  let truncatedIndices: Array<number> = [];

  if (breadcrumbs.length >= 5) {
    truncatedIndices = range(breadcrumbs.length - 4, 2);
    let filtered = breadcrumbs.filter((_, index) => {
      if (truncatedIndices.includes(index)) {
        return false;
      }

      return true;
    });

    filtered.splice(2, 0, { to: '', text: '...' });
    breadcrumbs = filtered;
  }

  return (
    <div className={styles.root}>
      {breadcrumbs.map((item, index) => {
        return index === breadcrumbs.length - 1 || item.text === '...' ? (
          <span> {item.text} /</span>
        ) : (
          <span>
            <NavLink to={item.to}> {item.text}</NavLink> /
          </span>
        );
      })}
    </div>
  );
};

export default Breadcrumbs;
