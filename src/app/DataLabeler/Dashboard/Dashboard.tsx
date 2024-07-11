import React from 'react';
import { Link } from 'react-router-dom';
import { SectionHeader, LoadingSpinner, Icon } from '@tapis/tapisui-common';
import {
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  CardFooter,
  CardText,
} from 'reactstrap';
import {
  useTapisConfig,
  Systems as SystemsHooks,
  Jobs as JobsHooks,
  Apps as AppsHooks,
} from '@tapis/tapisui-hooks';
import styles from './Dashboard.module.scss';
import './Dashboard.scss';

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
  const { accessToken, claims } = useTapisConfig();
  // const systems = SystemsHooks.useList({});
  // const jobs = JobsHooks.useList({});
  // const apps = AppsHooks.useList({ select: 'jobAttributes,version' });

  return (
    <div>
      <div className={styles.cards}>
        {accessToken ? (
          <>
            <DashboardCard
              icon="data-files"
              name="Training Datasets"
              text="Configure Storage for Training Datasets"
              link="/data-labeler/datasets"
            />
            <DashboardCard
              icon="simulation"
              name="Auto-Labeling"
              text="Select Model to Label Datasets"
              link="/data-labeler/auto"
            />
            <DashboardCard
              icon="user"
              name="Manual-Labeling"
              text="View Datasets and Manually Label Images"
              link="/data-labeler/manual"
            />
          </>
        ) : (
          <Card>
            <CardHeader>
              <div className={styles['card-header']}>
                <div>
                  <Icon name="user" className="dashboard__card-icon" />
                </div>
                <div>You are not logged in</div>
              </div>
            </CardHeader>
            <CardBody>
              <CardTitle>Please log in to use TAPIS</CardTitle>
            </CardBody>
            <CardFooter className={styles['card-footer']}>
              <Link to="/login">Proceed to login</Link>
              <Icon name="push-right" />
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
