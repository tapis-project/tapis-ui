import React from 'react';
import { NavLink } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { Button } from 'reactstrap';
import styles from './Breadcrumbs.module.scss';

export type BreadcrumbType = {
  to?: string;
  onClick?: (to: string) => void;
  text: string;
};

const BreadcrumbFragment: React.FC<BreadcrumbType> = ({
  to,
  onClick,
  text,
}) => {
  if (onClick) {
    return (
      <span>
        {' '}
        <Button
          color="link"
          className={styles.link}
          onClick={(e) => {
            e.preventDefault();
            to && onClick(to);
          }}
        >
          {text}
        </Button>{' '}
        /
      </span>
    );
  }
  if (to) {
    return (
      <span>
        {' '}
        <NavLink to={to}>{text}</NavLink> /
      </span>
    );
  }

  return (
    <span>
      {' '}
      {text} {`${text !== '...' ? '/' : ''}`}
    </span>
  );
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
        const { text, to, onClick } = item;
        if (index === truncatedBreadcrumbs.length - 1) {
          return <BreadcrumbFragment text={text} key={uuidv4()} />;
        }
        return (
          <BreadcrumbFragment
            text={text}
            to={to}
            onClick={onClick}
            key={uuidv4()}
          />
        );
      })}
    </div>
  );
};

export default Breadcrumbs;
