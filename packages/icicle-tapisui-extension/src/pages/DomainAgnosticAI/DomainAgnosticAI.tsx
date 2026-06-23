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
    label: 'Data Preparation/Cleaning: Out-of-distribution detection (OOD)',
    name: 'Forte',
    link: 'https://github.com/ICICLE-ai/forte-api',
  },
  {
    label:
      'Smart Labeler : Inteligent AI pipeline for Zero and Few shot object detection',
    name: 'Smart Labeler : Object detection',
    link: '/smart-labeler',
    internal: true,
  },
  {
    label:
      'Smart Labeler : Inteligent AI pipeline for Zero and Few shot object detection',
    name: 'Smart Labeler : Semantic segmentation',
    link: '/smart-segmentation',
    internal: true,
  },
  {
    label:
      'ICICLE Chatbook: A Chatbook built on top of ICICLE CI services to let you chat with your text, PDF, and other data.',
    name: 'ICICLE Chatbook',
    link: '/icicle-chatbook',
    internal: true,
  },
  {
    label: 'Semi Supervised and Fully Supervised High-Performance Training',
    name: 'Upcoming',
    link: '#',
    upcoming: true,
  },
  {
    label: 'Real Time Optimized Edge Inference',
    name: 'ML Edge',
    link: '/ml-edge',
    internal: true,
  },
  {
    label:
      'Playground for Model Creation, Adaptation, Training, Compression, and Inference',
    name: 'MLHub',
    link: '/ml-hub',
    internal: true,
  },
  {
    label: 'Accelerated Data Annotation',
    name: 'An ecologist or a researcher in animal sciences who wants to create an annotated/label dataset for downstream ecological studies (upcoming)',
    link: '#',
    upcoming: true,
  },
  {
    label: 'Generic Chatbot Creator for Domains',
    name: 'Domain researcher who wants to create a domain specific chatbot for an agronomist, farm service provider, or a farmer (upcoming)',
    link: '#',
    upcoming: true,
  },
  {
    label: 'ICICLE MCP: Allowing other tools to access ICICLE knowledge',
    name: 'ICICLE AI Component MCP',
    link: 'https://github.com/ICICLE-ai/catalog_mcp',
  },
  {
    label:
      'Science-driven natural language support for data analysis (Science Agents)',
    name: 'Upcoming',
    link: '#',
    upcoming: true,
  },
  {
    label: 'Authentic dataset augmentation for video datasets',
    name: 'Upcoming',
    link: '#',
    upcoming: true,
  },
];

export const DomainAgnosticAI: Component = () => {
  return (
    <PortalPageLayout title="Welcome to the ICICLE-AI-as-a-Service (ICICLE-AIaaS) page!">
      <div className={styles.contentBox}>
        <div className={styles.contentStack}>
          <div className={`${styles.introText} ${styles.introTextCompact}`}>
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

export default DomainAgnosticAI;
