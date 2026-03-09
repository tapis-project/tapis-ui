import React from 'react';
import { Link } from 'react-router-dom';
import { Component } from '@tapis/tapisui-extensions-core';
import PortalPageLayout from '../PortalShared/PortalPageLayout';
import styles from '../PortalShared/PortalPageLayout.module.scss';

const portalCards = [
  {
    title: 'AI-as-a-Service (ICICLE-AIaaS)',
    description:
      'Model creation, adaptation, training, inference, and AI utilities.',
    link: '/domain-agnostic-ai',
  },
  {
    title: 'CI-as-a-Service (ICICLE-CIaaS)',
    description:
      'Cyberinfrastructure services for data movement and orchestration.',
    link: '/domain-agnostic-ci',
  },
];

const domainCards = [
  {
    title: 'Digital-Agriculture-as-a-Service (ICICLE-DAaaS)',
    link: '/digital-ag-aaas',
  },
  {
    title: 'Animal-Ecology-as-a-Service (ICICLE-AEaaS)',
    link: '/animal-ecology-aaas',
  },
  {
    title: 'Food-Logistics-and-Security-as-a-Service (ICICLE-FLSaaS)',
    link: '/food-logistics-aaas',
  },
];

export const PortalHome: Component = () => {
  return (
    <PortalPageLayout title="ICICLE-as-a-Service (ICICLEaaS) Portal">
      <div className={styles.welcomeBox}>
        <div className={styles.welcomeTitle}>
          Welcome to the ICICLE-as-a-Service (ICICLEaaS) Portal!
        </div>
        <div className={styles.welcomeText}>
          <p>
            The NSF-AI Institute ICICLE (Intelligent Cyberinfrastructure with
            Computational Learning in the Environment) is building the next
            generation of CyberInfrastructure to render Artificial Intelligence
            (AI) more accessible to everyone and drive its further
            democratization in the larger society. The design focuses on the
            emerging Computing Continuum.
          </p>
          <p>
            The software components developed under ICICLE are being made
            available through three broad categories of services.
          </p>
        </div>
      </div>
      <div className={styles.cardSection}>
        <div className={styles.cardGrid}>
          {portalCards.map((card) => (
            <div key={card.title} className={styles.card}>
              <div>
                <div className={styles.cardTitle}>{card.title}</div>
                <div className={styles.cardText}>{card.description}</div>
              </div>
              <Link to={card.link} className={styles.cardButton}>
                Click to get started
              </Link>
            </div>
          ))}
          <div className={styles.card}>
            <div>
              <div className={styles.cardTitle}>
                Domain-as-a-Service (ICICLE-DOaaS)
              </div>
              <div className={styles.cardText}>
                Services tailored to specific domains within ICICLE.
              </div>
            </div>
            <div className={styles.subCardGrid}>
              {domainCards.map((card) => (
                <Link
                  key={card.title}
                  to={card.link}
                  className={styles.subCard}
                >
                  {card.title}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className={styles.noteCard}>
        Use ICICLE Catalog MCP with your AI Powered IDE. Learn more at{' '}
        <a
          href="https://github.com/ICICLE-ai/catalog_mcp"
          target="_blank"
          rel="noopener noreferrer"
        >
          ICICLE AI Component MCP
        </a>{' '}
        to explore ICICLE components through your AI powered IDE.
      </div>
    </PortalPageLayout>
  );
};

export default PortalHome;
