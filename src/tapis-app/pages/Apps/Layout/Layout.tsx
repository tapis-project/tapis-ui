import React from 'react';
import { AppsNav } from '../components';
import { Layout } from 'tapis-app/components';
import {
  SectionBody,
  SectionHeader,
  SectionNavWrapper,
} from 'tapis-app/components/Section';
import { Router } from '../Router';

const Apps: React.FC = () => {
  const header = (
    <SectionHeader>
      <div>Apps</div>
    </SectionHeader>
  );

  const subHeader = (
    <SectionHeader type={'sub-header'}>Job Launcher</SectionHeader>
  );

  const sidebar = (
    <SectionNavWrapper>
      <AppsNav />
    </SectionNavWrapper>
  );

  const body = (
    <div style={{ flex: 1 }}>
      <Router />
    </div>
  );

  return (
    <Layout
      top={header}
      left={sidebar}
      right={
        <SectionBody>
          <Layout top={subHeader} right={body} />
        </SectionBody>
      }
    />
  );
};

export default Apps;
