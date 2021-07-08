import React from 'react';
import { Link } from 'react-router-dom';
import { SectionHeader, Icon } from 'tapis-ui/_common';
import { Card, CardHeader, CardBody, CardTitle, CardFooter, CardText } from 'reactstrap';
import './Dashboard.module.scss';
import './Dashboard.scss';

type DashboardCardProps = {
  icon: string,
  link: string,
  counter: string,
  name: string,
  text: string
}

const DashboardCard: React.FC<DashboardCardProps> = ({icon, link, counter, name, text}) => {
  return (
    <Card styleName="card">
      <CardHeader>
        <div styleName="card-header">
          <div>
            <Icon name="data-files" className="dashboard__card-icon"/>
          </div>          
          <div>
            {name}
          </div>
        </div>
      </CardHeader>
      <CardBody>
        <CardTitle tag="h5">{counter}</CardTitle>
        <CardText>
          {text}
        </CardText>
      </CardBody>
      <CardFooter styleName="card-footer">
        <Link to={link}>Go to {name}</Link>
        <Icon name="push-right" />
      </CardFooter>
    </Card>
  )
}

const Dashboard: React.FC = () => {
  return (
    <div>
      <SectionHeader className="dashboard__section-header">Dashboard for {process.env.TAPIS_TENANT_URL}</SectionHeader>
      <div styleName="cards">
        <DashboardCard
          icon="data-files"
          name="Systems"
          text="Access TAPIS systems and files"
          link="/systems"
          counter=""
        />
        <DashboardCard
          icon="applications"
          name="Applications"
          text="View TAPIS applications and launch jobs"
          link="/apps"
          counter=""
        />
        <DashboardCard
          icon="jobs"
          name="Jobs"
          text="View status and details for previously launched TAPIS jobs"
          link="/jobs"
          counter=""
        />
      </div>
    </div>
  ) 
}

export default Dashboard;
