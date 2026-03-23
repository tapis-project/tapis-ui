import React from 'react';
import { Component } from '@tapis/tapisui-extensions-core';
import PortalPageLayout from '../PortalShared/PortalPageLayout';
import styles from '../PortalShared/PortalPageLayout.module.scss';

export const DomainSpecificServices: Component = () => {
  return (
    <PortalPageLayout title="Domain-as-a-Service (ICICLE-DOaaS)">
      <div className={styles.introText}>
        <p>
          Explore ICICLE services tailored to specific domains. Use the Portal
          Home page to navigate to the digital agriculture, animal ecology, and
          food logistics and security service pages.
        </p>
      </div>
    </PortalPageLayout>
  );
};

export default DomainSpecificServices;
