import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { SectionHeader, Icon } from 'tapis-ui/src/_common';
import { Card, CardHeader, CardBody, CardTitle, CardFooter, CardText } from 'reactstrap';
import { useAuthenticator, useSystems, useApps, useJobs  } from 'tapis-redux/src';
import { useTapisConfig } from 'tapis-hooks/src';
import { LoadingSpinner } from 'tapis-ui/src/_common';
import styles from './Dashboard.module.scss';
import './Dashboard.scss';

type DashboardCardProps = {
  icon: string,
  link: string,
  counter: string,
  name: string,
  text: string,
  loading: boolean
}

const DashboardCard: React.FC<DashboardCardProps> = ({icon, link, counter, name, text, loading}) => {
  return (
    <Card styleName={styles.card}>
      <CardHeader>
        <div  className={styles.cardHeader}>
          <div>
            <Icon name={icon} className="dashboard__card-icon"/>
          </div>          
          <div>
            {name}
          </div>
        </div>
      </CardHeader>
      <CardBody>
        <CardTitle tag="h5">
          {
            loading 
              ? <LoadingSpinner placement="inline" />
              : <div>{counter}</div>
          }
        </CardTitle>
        <CardText>
          {text}
        </CardText>
      </CardBody>
      <CardFooter className={styles.cardFooter}>
        <Link to={link}>Go to {name}</Link>
        <Icon name="push-right" />
      </CardFooter>
    </Card>
  )
}

const Dashboard: React.FC = () => {
  const { accessToken } = useTapisConfig();
  const systems = useSystems();
  const jobs = useJobs();
  const apps = useApps();
  const dispatch = useDispatch();

  // TODO: Replace useEffect with react-query dependent retrieval
  useEffect(
    () => {
      if (accessToken) {
        /*
        dispatch(systems.list({}));
        dispatch(jobs.list({}));
        dispatch(apps.list({}));
        */
      }
    },
    [ accessToken ]
  )


  return (
    <div>
      <SectionHeader className="dashboard__section-header">Dashboard for {process.env.TAPIS_TENANT_URL}</SectionHeader>
      <div className={styles.header}>
        <h5>Welcome to TAPIS-UI</h5>
        <div>
          This web application demonstrates how to leverage the TAPIS API and <i>tapis-ui</i> React components
          to build a serverless interface for High Performance Computing systems.
        </div>
      </div>
      <div className={styles.cards}>
        {
          accessToken ? (
            <>
              <DashboardCard
                icon="data-files"
                name="Systems"
                text="Access TAPIS systems and files"
                link="/systems"
                counter={`${systems.systems.results.length} systems`}
                loading={systems.systems.loading}
              />
              <DashboardCard
                icon="applications"
                name="Applications"
                text="View TAPIS applications and launch jobs"
                link="/apps"
                counter={`${apps.apps.results.length} apps`}
                loading={apps.apps.loading}
              />
              <DashboardCard
                icon="jobs"
                name="Jobs"
                text="View status and details for previously launched TAPIS jobs"
                link="/jobs"
                counter={`${jobs.jobs.results.length} jobs`}
                loading={jobs.jobs.loading}
              />
            </>
          ) : (
            <Card>
              <CardHeader>
                <div className={styles.cardHeader}>
                  <div>
                    <Icon name="user" className="dashboard__card-icon"/>
                  </div>          
                  <div>
                    You are not logged in
                  </div>
                </div>
              </CardHeader>
              <CardBody>
                <CardTitle>
                  Please log in to use TAPIS
                </CardTitle>
              </CardBody>
              <CardFooter className={styles.cardFooter}>
                <Link to="/login">Proceed to login</Link>
                <Icon name="push-right" /> 
              </CardFooter>
            </Card>
          )
        }

      </div>
    </div>
  ) 
}

export default Dashboard;
