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

// Platform metadata mapping
const PLATFORM_METADATA: Record<
  string,
  { name: string; description: string; icon: string; capabilities: string[] }
> = {
  Huggingface: {
    name: 'Hugging Face',
    description:
      'Access thousands of pre-trained models from the Hugging Face Hub',
    icon: 'simulation',
    capabilities: [
      'ListModels',
      'GetModel',
      'IngestModel',
      'PublishModel',
      'ListDatasets',
      'GetDataset',
      'IngestDataset',
    ],
  },
  Github: {
    name: 'GitHub',
    description: 'Browse machine learning models from GitHub repositories',
    icon: 'code',
    capabilities: ['IngestModel', 'IngestDataset'],
  },
  Git: {
    name: 'Git',
    description: 'Access models from Git repositories',
    icon: 'code',
    capabilities: ['IngestModel', 'IngestDataset'],
  },
  Patra: {
    name: 'Patra',
    description: 'Discover models from the Patra platform',
    icon: 'data-processing',
    capabilities: ['ListModels', 'GetModel', 'DiscoverModels'],
  },
  TaccTapis: {
    name: 'TACC Tapis',
    description: 'Access models from TACC Tapis systems',
    icon: 'globe',
    capabilities: ['ListModels', 'GetModel', 'IngestModel'],
  },
  S3: {
    name: 'Amazon S3',
    description: 'Browse models stored in S3 buckets',
    icon: 'data-files',
    capabilities: ['ListModels', 'GetModel', 'IngestModel'],
  },
};

// Hardcoded platforms data
const PLATFORMS = [
  'Huggingface',
  'Github',
  'Git',
  'Patra',
  'TaccTapis',
  'S3',
] as const;

const Dashboard: React.FC = () => {
  // Transform platforms data for display
  const platformInfos = PLATFORMS.map((platform: string) => ({
    platform,
    ...PLATFORM_METADATA[platform],
  }));

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

        <div className={styles['platforms-container']}>
          <div className={styles['card-container']}>
            {platformInfos.map((platformInfo: any) => (
              <PlatformCard
                key={platformInfo.platform}
                platform={platformInfo}
                link={`/ml-hub/platforms/${platformInfo.platform}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
