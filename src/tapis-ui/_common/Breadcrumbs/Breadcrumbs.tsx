import React from 'react';

import { NavLink } from 'react-router-dom';
import styles from './Breadcrumbs.module.scss';

export type BreadcrumbType = {
  to: string;
  text: string;
};

type BreadcrumbsProps = {
  breadcrumbs: Array<BreadcrumbType>;
  defaultMessage?: string;
};

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  breadcrumbs,
  defaultMessage,
}) => {
  return (
    <div className={styles.root}>
      {breadcrumbs.length === 0
        ? defaultMessage
        : breadcrumbs.map((item, index) => {
            return index === breadcrumbs.length - 1 ? (
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
