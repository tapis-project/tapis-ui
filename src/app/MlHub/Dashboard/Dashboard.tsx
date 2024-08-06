import React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@tapis/tapisui-common';
import {
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  CardFooter,
  CardText,
} from 'reactstrap';
import styles from './Dashboard.module.scss';

type DashboardCardProps = {
  icon: string;
  link: string;
  name: string;
  text: string;
};

const DashboardCard: React.FC<DashboardCardProps> = ({
  icon,
  link,
  name,
  text,
}) => {
  return (
    <Card className={styles.card}>
      <CardHeader>
        <div className={styles['card-header']}>
          <div>
            <Icon name={icon} className="dashboard__card-icon" />
          </div>
          <div>{name}</div>
        </div>
      </CardHeader>
      <CardBody>
        <CardTitle tag="h5"></CardTitle>
        <CardText>{text}</CardText>
      </CardBody>
      <CardFooter className={styles['card-footer']}>
        <Link to={link}>Go to {name}</Link>
        <Icon name="push-right" />
      </CardFooter>
    </Card>
  );
};

const Dashboard: React.FC = () => {
  return (
    <div id="dashboard" className={styles['dashboard']}>
      <div id="dashboard-cards" className={styles['card-container']}>
        <DashboardCard
          icon="simulation"
          name="Models Hub"
          text="View available ML models"
          link="/ml-hub/models"
        />
        <DashboardCard
          icon="search-folder"
          name="Datasets Hub"
          text="View available Datasets"
          link="/ml-hub/datasets"
        />
        <DashboardCard
          icon="multiple-coversation"
          name="Inference Server"
          text="View available inference server for ML models"
          link="/ml-hub/inference"
        />
        <DashboardCard
          icon="data-processing"
          name="Training Engine"
          text="View ML model training jobs"
          link="/ml-hub/training"
        />
      </div>
    </div>
  );
};

export default Dashboard;
