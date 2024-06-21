import styles from './DashboardCard.module.scss';
import React from 'react';
import { Link } from 'react-router-dom';
import { CircularProgress } from '@mui/material';

type DashboardCardProps = {
  title: string;
  objects: Array<unknown>;
  icon: any;
  to: string;
  isLoading: boolean;
};

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  objects,
  icon,
  to,
  isLoading,
}) => {
  return (
    <Link style={{ textDecoration: 'none' }} to={to}>
      <div className={styles['card']}>
        <div className={styles['icon']}>{icon}</div>
        <div className={styles['title']}>{title}</div>
        <div className={styles['count']}>
          {isLoading ? <CircularProgress /> : objects.length}
        </div>
      </div>
    </Link>
  );
};

export default DashboardCard;
