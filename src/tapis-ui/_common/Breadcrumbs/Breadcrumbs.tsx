import React from 'react';

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

  if (breadcrumbs.length >= 5) {
    // First 2 breadcrumbs
    let truncatedBreadcrumbs = breadcrumbs.slice(0, 2);

    // Ellipsis representing truncated breadcrumbs
    truncatedBreadcrumbs.push({ to: '', text: '\u2026' })

    // Last 2 breadcrumbs
    truncatedBreadcrumbs.push(...breadcrumbs.slice(breadcrumbs.length - 2, breadcrumbs.length))
    breadcrumbs = truncatedBreadcrumbs;
  }

  return (
    <div className={styles.root}>
      {breadcrumbs.map((item, index) => {
        return index === breadcrumbs.length - 1 || item.text === '\u2026' ? (
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
