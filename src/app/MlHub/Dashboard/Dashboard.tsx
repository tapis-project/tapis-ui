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
  Spinner,
  Alert,
} from 'reactstrap';
import { QueryWrapper } from '@tapis/tapisui-common';
import { MLHub as Hooks } from '@tapis/tapisui-hooks';
import PlatformCard from '../_components/PlatformCard';
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

// Platform metadata mapping for display information
const PLATFORM_METADATA: Record<
  string,
  { name: string; description: string; icon: string }
> = {
  HuggingFace: {
    name: 'Hugging Face',
    description:
      'Access thousands of pre-trained models from the Hugging Face Hub',
    icon: 'simulation',
  },
  Github: {
    name: 'GitHub',
    description: 'Browse models from GitHub repositories',
    icon: 'code',
  },
  Git: {
    name: 'Git',
    description: 'Access models from Git repositories',
    icon: 'data-files',
  },
  Patra: {
    name: 'Patra',
    description: 'Discover models from the Patra platform',
    icon: 'data-processing',
  },
  'tacc-tapis': {
    name: 'TACC Tapis',
    description: 'Access models from TACC Tapis systems',
    icon: 'globe',
  },
  s3: {
    name: 'Amazon S3',
    description: 'Browse models stored in S3 buckets',
    icon: 'data-files',
  },
};

const Dashboard: React.FC = () => {
  const {
    data: platforms,
    isLoading,
    error,
  } = Hooks.Models.Platforms.useList();

  // Transform platforms data for display
  const platformInfos =
    platforms
      ?.map((platformData: any) => {
        const metadata = PLATFORM_METADATA[platformData.name] || {
          name: platformData.name,
          description: `Discover and access machine learning models from ${platformData.name}`,
          icon: 'data-processing',
        };

        return {
          platform: platformData.name,
          name: metadata.name,
          description: metadata.description,
          icon: metadata.icon,
          capabilities: platformData.capabilities,
        };
      })
      .sort((a: any, b: any) => a.name.localeCompare(b.name)) || [];

  return (
    <div id="dashboard" className={styles['dashboard']}>
      {/* MLHub Services Section */}
      <div className={styles['section']}>
        <h2 className={styles['section-title']}>MLHub Services</h2>
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

      {/* Platforms Section */}
      <div className={styles['section']}>
        <h2 className={styles['section-title']}>Available Platforms</h2>
        <p className={styles['section-description']}>
          Browse and discover machine learning models from various platforms
        </p>

        <QueryWrapper
          isLoading={isLoading}
          error={error}
          className={styles['platforms-container']}
        >
          <div className={styles['card-container']}>
            {platformInfos.map((platformInfo: any) => (
              <PlatformCard
                key={platformInfo.platform}
                platform={platformInfo}
                link={`/ml-hub/models/platform/${platformInfo.platform}`}
              />
            ))}
          </div>
        </QueryWrapper>
      </div>
    </div>
  );
};

export default Dashboard;
