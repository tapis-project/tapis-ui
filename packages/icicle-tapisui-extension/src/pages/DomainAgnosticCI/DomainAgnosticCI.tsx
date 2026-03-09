import React from 'react';
import { Link } from 'react-router-dom';
import { Component } from '@tapis/tapisui-extensions-core';
import PortalPageLayout from '../PortalShared/PortalPageLayout';
import styles from '../PortalShared/PortalPageLayout.module.scss';

type ServiceItem = {
  label: string;
  name: string;
  link: string;
  internal?: boolean;
  upcoming?: boolean;
};

const services: ServiceItem[] = [
  {
    label: 'Authentication and Orchestration Services',
    name: 'TAPIS',
    link: 'https://tapis.readthedocs.io/en/latest/contents.html',
  },
  {
    label: 'Drone Based Data Collection and Transfer',
    name: 'OpenPASS',
    link: '/openpass',
    internal: true,
  },
  {
    label: 'Drone Based Data Collection and Transfer',
    name: 'WildWing',
    link: 'https://github.com/jennamk14/wildwing-icicle',
  },
  {
    label: 'Drone Based Data Collection and Transfer',
    name: 'Custom Camera-Trap Backpacks linked to drones and/or acoustic sensors',
    link: '#',
    upcoming: true,
  },
  {
    label: 'Data Preprocessing',
    name: 'Upcoming',
    link: '#',
    upcoming: true,
  },
  {
    label:
      'Data Movement, Accelerated Edge to Cloud/HPC and Cloud/HPC to Cloud/HPC Data Movement',
    name: 'ArrayMorph',
    link: 'https://github.com/ICICLE-ai/ArrayMorph/blob/v0.1.1/README.md',
  },
  {
    label: 'Model Inference to Heatmap Generation and Visualization',
    name: 'Upcoming',
    link: '#',
    upcoming: true,
  },
  {
    label: 'Shapefile Generation and Visualizations',
    name: 'Upcoming',
    link: '#',
    upcoming: true,
  },
  {
    label: 'HPC Job Submission Optimizer',
    name: 'HARP',
    link: 'https://github.com/ICICLE-ai/harp',
  },
];

export const DomainAgnosticCI: Component = () => {
  return (
    <PortalPageLayout title="Welcome to the ICICLE-CI-as-a-Service (ICICLE-CIaaS) page!">
      <div className={styles.contentBox}>
        <div className={styles.contentStack}>
          <div className={`${styles.introText} ${styles.introTextCompact}`}>
            <p>
              Many of these services are focused on modern applications
              targeting the edge-to-cloud/HPC computing continuum.
            </p>
            <p>
              These services can be used in a domain agnostic manner. Please
              click on the service link to get more information on how to use
              this service in a plug-and-play manner.
            </p>
          </div>
          <div className={styles.serviceList}>
            {services.map((service) => (
              <div key={service.name} className={styles.serviceRow}>
                <div className={styles.serviceLabel}>{service.label}</div>
                {service.upcoming ? (
                  <div className={styles.cardText}>{service.name}</div>
                ) : service.internal ? (
                  <Link to={service.link} className={styles.serviceLink}>
                    {service.name}
                  </Link>
                ) : (
                  <a
                    href={service.link}
                    className={styles.serviceLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {service.name}
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </PortalPageLayout>
  );
};

export default DomainAgnosticCI;
