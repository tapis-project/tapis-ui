import React from 'react';
import { Link } from 'react-router-dom';
import { SectionHeader, LoadingSpinner, Icon } from 'tapis-ui/_common';
import {
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  CardFooter,
  CardText,
} from 'reactstrap';
import { useTapisConfig } from 'tapis-hooks';
import { useList as useSystemsList } from 'tapis-hooks/systems';
import { useList as useJobsList } from 'tapis-hooks/jobs';
import { useList as useAppsList } from 'tapis-hooks/apps';
import styles from './Dashboard.module.scss';
import './Dashboard.scss';

type DashboardCardProps = {
  icon: string;
  link: string;
  counter: string;
  name: string;
  text: string;
  loading: boolean;
};

const DashboardCard: React.FC<DashboardCardProps> = ({
  icon,
  link,
  counter,
  name,
  text,
  loading,
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
        <CardTitle tag="h5">
          {loading ? (
            <LoadingSpinner placement="inline" />
          ) : (
            <div>{counter}</div>
          )}
        </CardTitle>
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
  const systems = useSystemsList({});
  const jobs = useJobsList({});
  const apps = useAppsList({ select: 'jobAttributes,version' });

  return (
    <div>
      <SectionHeader className="dashboard__section-header">
        Dashboard for {claims['tapis/tenant_id']}
      </SectionHeader>
      <div className={styles.cards}>
        {accessToken ? (
          <>
            <DashboardCard
              icon="data-files"
              name="Systems"
              text="View TAPIS systems"
              link="/systems"
              counter={`${systems?.data?.result?.length} systems`}
              loading={systems?.isLoading}
            />
            <DashboardCard
              icon="folder"
              name="Files"
              text="Access files available on TAPIS systems"
              link="/files"
              counter={`Files available on ${systems?.data?.result?.length} systems`}
              loading={systems?.isLoading}
            />
            <DashboardCard
              icon="applications"
              name="Applications"
              text="View TAPIS applications and launch jobs"
              link="/apps"
              counter={`${apps?.data?.result?.length} apps`}
              loading={apps?.isLoading}
            />
            <DashboardCard
              icon="jobs"
              name="Jobs"
              text="View status and details for previously launched TAPIS jobs"
              link="/jobs"
              counter={`${jobs?.data?.result?.length} jobs`}
              loading={jobs?.isLoading}
            />
            <DashboardCard
              icon="share"
              name="ML Hub"
              text="View available models and datasets, run inference and training on ML models"
              link="/ml-hub"
              counter={`${4} services`}
              loading={apps?.isLoading}
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
