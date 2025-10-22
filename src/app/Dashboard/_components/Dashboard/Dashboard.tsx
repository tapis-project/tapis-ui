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
  Authenticator as AuthenticatorHooks,
} from '@tapis/tapisui-hooks';
import styles from './Dashboard.module.scss';
import './Dashboard.scss';
import { Apps, Systems } from '@tapis/tapis-typescript';
import { useExtension } from 'extensions';

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
  const { accessToken, claims, basePath } = useTapisConfig();
  const { extension } = useExtension();
  const systems = SystemsHooks.useList({
    listType: Systems.ListTypeEnum.All,
    select: 'allAttributes',
    computeTotal: true,
    limit: 1,
  });
  const jobs = JobsHooks.useList({
    computeTotal: true,
    limit: 1,
  });
  const apps = AppsHooks.useList({
    listType: Apps.ListTypeEnum.All,
    select: 'jobAttributes,version',
    computeTotal: true,
    limit: 1,
  });

  const systemsTotal = (systems?.data as any)?.metadata?.totalCount ?? 0;
  const systemsTotalCount = systemsTotal === -1 ? 0 : systemsTotal;

  const appsTotal = (apps?.data as any)?.metadata?.totalCount ?? 0;
  const appsTotalCount = appsTotal === -1 ? 0 : appsTotal;

  const jobsTotal = (jobs?.data as any)?.metadata?.totalCount ?? 0;
  const jobsTotalCount = jobsTotal === -1 ? 0 : jobsTotal;

  return (
    <div>
      <SectionHeader>
        <div style={{ marginLeft: '1.2rem' }}>
          Dashboard for{' '}
          {basePath.replace('https://', '').replace('http://', '')}
        </div>
      </SectionHeader>
      <div className={styles.cards}>
        {accessToken ? (
          <>
            <Card
              className={`${styles.card} ${styles['welcome-card']} ${styles['card-wide']}`}
              style={{
                width: '51rem',
              }}
            >
              <CardHeader>
                <div className={styles['card-header']}>
                  <div>
                    <Icon
                      name="applications"
                      className="dashboard__card-icon"
                    />
                  </div>
                  <div>Welcome to TapisUI!</div>
                </div>
              </CardHeader>
              <CardBody>
                <CardText>
                  TapisUI is a React + TypeScript web application that provides
                  a unified, user-friendly interface which provides validated,
                  up-to-date, and automated access to all Tapis Services.
                  TapisUI is designed for researchers, students, and developers
                  who want to manage computational resources, launch jobs,
                  deploy containers, and interface with cyberinfrastructure.
                </CardText>
                <div className={styles['welcome-links']}>
                  <div>
                    📚{' '}
                    <a
                      href="https://tapis.readthedocs.io/en/latest/technical/tapisui.html"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      TapisUI & Tapis Documentation
                    </a>
                  </div>
                  <div>
                    🔧{' '}
                    <a
                      href="https://tapis-project.github.io/live-docs/?service=Systems"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Live Tapis Documentation
                    </a>
                  </div>
                  <div>
                    💻{' '}
                    <a
                      href="https://github.com/tapis-project/tapis-ui"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      GitHub Repository
                    </a>
                  </div>
                </div>
              </CardBody>
            </Card>
            <DashboardCard
              icon="data-files"
              name="Systems"
              text="View TAPIS systems"
              link="/systems"
              counter={`${systemsTotalCount} systems`}
              loading={systems?.isLoading}
            />
            <DashboardCard
              icon="folder"
              name="Files"
              text="Access files available on TAPIS systems"
              link="/files"
              counter={`Files available on ${systemsTotalCount} systems`}
              loading={systems?.isLoading}
            />
            <DashboardCard
              icon="applications"
              name="Applications"
              text="View TAPIS applications and launch jobs"
              link="/apps"
              counter={`${appsTotalCount} apps`}
              loading={apps?.isLoading}
            />
            <DashboardCard
              icon="jobs"
              name="Jobs"
              text="View status and details for previously launched TAPIS jobs"
              link="/jobs"
              counter={`${jobsTotalCount} jobs`}
              loading={jobs?.isLoading}
            />
            {extension !== undefined && extension.showMLHub != false && (
              <DashboardCard
                icon="share"
                name="ML Hub"
                text="View available models and datasets, run inference and training on ML models"
                link="/ml-hub"
                counter={`${4} services`}
                loading={apps?.isLoading}
              />
            )}
            {extension !== undefined && extension.showMLEdge != false && (
              <DashboardCard
                icon="simulation"
                name="ML Edge"
                text="View available reports and create new analysis"
                link="/ml-edge"
                counter={`${2} services`}
                loading={apps?.isLoading}
              />
            )}
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
