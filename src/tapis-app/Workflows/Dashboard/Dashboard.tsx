import React from 'react';
import { Workflows as Hooks } from '@tapis/tapisui-hooks';
import { Link } from 'react-router-dom';
import { LoadingSpinner, Icon } from 'tapis-ui/_common';
import {
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  CardFooter,
  CardText,
} from 'reactstrap';
import styles from './Dashboard.module.scss';
import { Toolbar } from '../_components';

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
  const groups = Hooks.Groups.useList();
  const groupIds: Array<string> = [];
  groups.data?.result.map((group) => groupIds.push(group.id!));
  const identities = Hooks.Identities.useList();
  const archives = Hooks.Archives.useListAll({ groupIds });
  const pipelines = Hooks.Pipelines.useListAll({ groupIds });

  return (
    <div id="dashboard">
      <Toolbar buttons={['creategroup', 'createidentity']} />
      <div id="dashboard-cards" className={styles['card-container']}>
        <DashboardCard
          icon="publications"
          name="Pipelines"
          text="View Workflow pipelines"
          link="/workflows/pipelines"
          counter={`${pipelines?.data?.result?.length} pipelines`}
          loading={pipelines?.isLoading}
        />
        <DashboardCard
          icon="user"
          name="Groups"
          text="View Workflow groups"
          link="/workflows/groups"
          counter={`${groups?.data?.result?.length} groups`}
          loading={groups?.isLoading}
        />
        <DashboardCard
          icon="folder"
          name="Archives"
          text="View Workflow groups"
          link="/workflows/archives"
          counter={`${archives?.data?.result?.length} archives`}
          loading={archives?.isLoading}
        />
        <DashboardCard
          icon="user"
          name="Identities"
          text="View Workflow identities"
          link="/workflows/identities"
          counter={`${identities?.data?.result?.length} identities`}
          loading={identities?.isLoading}
        />
      </div>
    </div>
  );
};

export default Dashboard;
