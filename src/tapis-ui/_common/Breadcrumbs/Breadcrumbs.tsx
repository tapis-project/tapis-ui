import React from 'react';
import { NavLink } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

export type BreadcrumbType = {
  to?: string;
  text: string;
};

type BreadcrumbsProps = {
  breadcrumbs: Array<BreadcrumbType>;
};

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ breadcrumbs }) => {
  let truncatedBreadcrumbs = breadcrumbs;
  if (breadcrumbs.length >= 5) {
    // First 2 breadcrumbs
    truncatedBreadcrumbs = [...breadcrumbs.slice(0, 2)];

    // Ellipsis representing truncated breadcrumbs
    truncatedBreadcrumbs.push({ text: '\u2026' });

    // Last 2 breadcrumbs
    truncatedBreadcrumbs.push(
      ...breadcrumbs.slice(breadcrumbs.length - 2, breadcrumbs.length)
    );
  }

  return (
    <div>
      {truncatedBreadcrumbs.map((item, index) => {
        return index === truncatedBreadcrumbs.length - 1 || !item.to ? (
          <span key={uuidv4()}> {item.text} /</span>
        ) : (
          <span key={uuidv4()}>
            <NavLink to={item.to}> {item.text}</NavLink> /
          </span>
        );
      })}
    </div>
  );
};

export default Breadcrumbs;
