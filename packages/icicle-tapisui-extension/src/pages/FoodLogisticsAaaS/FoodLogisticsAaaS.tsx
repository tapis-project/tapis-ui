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
    label:
      'Graph Neural Networks (GNN)-based prediction of U.S. food trade flows',
    name: 'Food Flow Portal',
    link: '/food-flow-portal',
    internal: true,
  },
  {
    label: 'FEAST',
    name: 'FEAST',
    link: '/feast',
    internal: true,
  },
  {
    label: 'Agriculture Routing',
    name: 'Agriculture Routing',
    link: 'https://github.com/ICICLE-ai/ag_routing_data_generator',
  },
  {
    label: 'Sandbox',
    name: 'Food Security Sandbox',
    link: '/food-security-sandbox',
    internal: true,
  },
];

export const FoodLogisticsAaaS: Component = () => {
  return (
    <PortalPageLayout title="Welcome to the ICICLE-Food-Logistics-and-Security-as-a-Service (ICICLE-FLaaS) page!">
      <div className={styles.contentBox}>
        <div className={styles.contentStack}>
          <div className={`${styles.introText} ${styles.introTextCompact}`}>
            <p>
              These services provide end-to-end workflows to carry out multiple
              different tasks in the area of Food Logistics and Security. Please
              click on the service link to get more information on how to use
              this service in a plug-and-play manner.
            </p>
          </div>
          <div className={styles.serviceList}>
            {services.map((service) => (
              <div key={service.label} className={styles.serviceRow}>
                <div className={styles.serviceLabel}>{service.label}</div>
                {service.upcoming ? (
                  <div className={styles.cardText}>Upcoming</div>
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

export default FoodLogisticsAaaS;
