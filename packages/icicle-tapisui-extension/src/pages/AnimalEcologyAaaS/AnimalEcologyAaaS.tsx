import React from 'react';
import { Component } from '@tapis/tapisui-extensions-core';
import PortalPageLayout from '../PortalShared/PortalPageLayout';
import styles from '../PortalShared/PortalPageLayout.module.scss';

type ServiceItem = {
  label: string;
  upcoming?: boolean;
};

const services: ServiceItem[] = [
  {
    label:
      'Design custom camera-trap hardware & software (ML-driven Planner for Ecologists)',
    upcoming: true,
  },
  {
    label: 'Conduct Multi-modal Wildlife Monitoring using Commodity Devices',
    upcoming: true,
  },
  {
    label: 'Citizen Science Applications with Custom Camera-Trap Backpacks',
    upcoming: true,
  },
];

export const AnimalEcologyAaaS: Component = () => {
  return (
    <PortalPageLayout title="Welcome to the ICICLE-Animal-Ecology-as-a-Service (ICICLE-AEaaS) page!">
      <div className={styles.contentBox}>
        <div className={styles.contentStack}>
          <div className={`${styles.introText} ${styles.introTextCompact}`}>
            <p>
              These services provide end-to-end workflows to carry out multiple
              different tasks in the area of Animal Ecology. Please click on the
              service link to get more information on how to use this service in
              a plug-and-play manner.
            </p>
          </div>
          <div className={styles.serviceList}>
            {services.map((service) => (
              <div key={service.label} className={styles.serviceRow}>
                <div className={styles.serviceLabel}>{service.label}</div>
                <div className={styles.cardText}>Upcoming</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PortalPageLayout>
  );
};

export default AnimalEcologyAaaS;
