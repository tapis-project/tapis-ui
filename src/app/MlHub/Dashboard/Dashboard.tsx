import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@tapis/tapisui-common';
import { QueryWrapper } from '@tapis/tapisui-common';
import { MLHub as Hooks } from '@tapis/tapisui-hooks';
import { ChatContext } from 'app/_context/chat';
import PlatformCard from '../_components/PlatformCard';
import styles from './Dashboard.module.scss';

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
    description: 'Ingest models from GitHub repositories',
    icon: 'code',
  },
  Git: {
    name: 'Git',
    description: 'Ingest models from private Git repositories',
    icon: 'data-files',
  },
  Patra: {
    name: 'Patra',
    description: 'Discover models on the Patra platform',
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
  const chatContextValue = useContext(ChatContext);
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
      {/* Hero Section */}
      <div className={styles['hero-section']}>
        <div className={styles['hero-content']}>
          <h1>AI-enabled Model Discovery and Deployment</h1>
          <p className={styles['hero-text']}>
            Access a unified interface to discover, manage, and deploy models
            from various platforms.
          </p>
          <div className={styles['hero-actions']}>
            <Link to="/ml-hub/models" className={styles['hero-btn']}>
              <Icon name="search-folder" className={styles['btn-icon']} />
              Search Models
            </Link>
            <button
              className={styles['hero-btn']}
              onClick={() => chatContextValue?.toggleChat()}
            >
              <Icon
                name="multiple-coversation"
                className={styles['btn-icon']}
              />
              Discover with AI
            </button>
            <Link to="/ml-hub/platforms" className={styles['hero-btn']}>
              <Icon name="search-folder" className={styles['btn-icon']} />
              Explore platforms
            </Link>
          </div>
        </div>
      </div>

      {/* How it Works / Hints Section */}
      <div className={styles['steps-section']}>
        <div className={styles['step-card']}>
          <div className={styles['step-icon']}>
            <Icon name="search-folder" />
          </div>
          <h3>1. Discover</h3>
          <p>
            Browse our extensive catalog or use our AI Chatbot to find the right
            models for your task.
          </p>
        </div>
        <div className={styles['step-card']}>
          <div className={styles['step-icon']}>
            <Icon name="simulation" />
          </div>
          <h3>2. Select</h3>
          <p>
            View model details, versions, and capabilities to find the perfect
            match for your needs.
          </p>
        </div>
        <div className={styles['step-card']}>
          <div className={styles['step-icon']}>
            <Icon name="data-processing" />
          </div>
          <h3>3. Deploy</h3>
          <p>Easily deploy models to Tapis systems.</p>
        </div>
      </div>

      {/* Platforms Section */}
      <div className={styles['section']}>
        <h2 className={styles['section-title']}>Connected Platforms</h2>
        <p className={styles['section-description']}>
          Explore models available from these providers
        </p>

        <QueryWrapper
          isLoading={isLoading}
          error={error}
          className={styles['platforms-container']}
        >
          <div className={styles['card-container']}>
            {platformInfos.map((platformInfo: any) => {
              // Determine link and whether it's external based on platform
              let link: string;
              let isExternal = false;

              if (platformInfo.platform === 'Github') {
                link = 'https://github.com';
                isExternal = true;
              } else if (platformInfo.platform === 'Git') {
                // TODO: Update with desired Git link
                link = 'https://git-scm.com';
                isExternal = true;
              } else {
                link = `/ml-hub/models/platform/${platformInfo.platform}`;
                isExternal = false;
              }

              return (
                <PlatformCard
                  key={platformInfo.platform}
                  platform={platformInfo}
                  link={link}
                  isExternal={isExternal}
                />
              );
            })}
          </div>
        </QueryWrapper>
      </div>
    </div>
  );
};

export default Dashboard;
