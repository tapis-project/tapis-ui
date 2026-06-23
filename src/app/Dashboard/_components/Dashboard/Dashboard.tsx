import React, { useState, useRef, useCallback } from 'react';
import { Link, useHistory } from 'react-router-dom';
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
  const { accessToken, claims, basePath, setAccessToken } = useTapisConfig();
  const navigate = useHistory();
  // TODO All tenant-specific functionality must be refactored into their respective
  // extenstions
  const { extension } = useExtension();

  // Hidden dev token input — revealed by long-pressing "TAPIS" for 3s
  const isDevHost =
    location.hostname === 'localhost' ||
    location.hostname === 'icicleai.tapis.io' ||
    location.hostname === 'public.tapis.io';
  const [showDevInput, setShowDevInput] = useState(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onTapisPointerDown = useCallback(() => {
    if (!isDevHost) return;
    longPressTimer.current = setTimeout(() => setShowDevInput((v) => !v), 3000);
  }, [isDevHost]);
  const onTapisPointerUp = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);
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
              style={{ width: '51rem' }}
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
          <>
            <Card>
              <CardHeader style={{ cursor: 'default' }}>
                <div className={styles['card-header']}>
                  <div>
                    <Icon name="user" className="dashboard__card-icon" />
                  </div>
                  <div>You are not logged in</div>
                </div>
              </CardHeader>
              <CardBody>
                <CardTitle>
                  Please log in to use{' '}
                  <span
                    onPointerDown={onTapisPointerDown}
                    onPointerUp={onTapisPointerUp}
                    onPointerLeave={onTapisPointerUp}
                    style={{ userSelect: 'none' }}
                  >
                    TAPIS
                  </span>
                </CardTitle>
              </CardBody>
              <CardFooter
                className={styles['card-footer']}
                onClick={() => navigate.push('/login')}
                style={{ cursor: 'pointer', alignItems: 'center' }}
              >
                <Link to="/login" style={{ lineHeight: 1 }}>
                  Proceed to login
                </Link>
                <span
                  style={{ color: '#007bff', lineHeight: 1, display: 'flex' }}
                >
                  <Icon name="push-right" />
                </span>
              </CardFooter>
            </Card>
            {isDevHost && showDevInput && (
              <input
                type="text"
                placeholder="Paste JWT access_token"
                autoFocus
                style={{
                  width: '100%',
                  fontFamily: 'monospace',
                  fontSize: '0.7rem',
                  padding: '4px',
                  marginTop: '0.5rem',
                  opacity: 0.6,
                }}
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === 'Enter') {
                    const jwt = (e.target as HTMLInputElement).value.trim();
                    if (jwt) {
                      setAccessToken({
                        access_token: jwt,
                        expires_at: new Date(
                          Date.now() + 14400 * 1000
                        ).toISOString(),
                        expires_in: 14400,
                      });
                      navigate.push('/');
                    }
                  }
                }}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
