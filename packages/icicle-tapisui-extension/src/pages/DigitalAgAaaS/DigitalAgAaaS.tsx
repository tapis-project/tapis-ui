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
    label: 'Harvest',
    name: 'Harvest',
    link: '/harvest',
    internal: true,
  },
  {
    label: 'Drone-based Field Analysis',
    name: 'Upcoming',
    link: '#',
    upcoming: true,
  },
  {
    label: 'Drone-based Spot & Variable Rate Spraying',
    name: 'Upcoming',
    link: '#',
    upcoming: true,
  },
  {
    label: 'Tractor-based Spot & Variable Rate Spraying',
    name: 'Upcoming',
    link: '#',
    upcoming: true,
  },
  {
    label: 'Post-Tillage Soil Aggregate Size Analysis',
    name: 'Upcoming',
    link: '#',
    upcoming: true,
  },
  {
    label: 'Post-Tillage Crop Residue Cover Analysis',
    name: 'Upcoming',
    link: '#',
    upcoming: true,
  },
  {
    label: 'Cultural Practice and Geography Specific Chatbot Creator',
    name: 'Upcoming',
    link: '#',
    upcoming: true,
  },
];

export const DigitalAgAaaS: Component = () => {
  return (
    <PortalPageLayout title="Welcome to the ICICLE-Digital-Agriculture-as-a-Service (ICICLE-DAaaS) page!">
      <div className={styles.contentBox}>
        <div className={styles.contentStack}>
          <div className={`${styles.introText} ${styles.introTextCompact}`}>
            <p>
              These services provide end-to-end workflows to carry out multiple
              different tasks in the area of Digital Agriculture. Please click
              on the service link to get more information on how to use this
              service in a plug-and-play manner.
            </p>
          </div>
          <div className={styles.serviceList}>
            {services.map((service) => (
              <div key={service.label} className={styles.serviceRow}>
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

export default DigitalAgAaaS;
