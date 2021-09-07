import React from 'react';
import { Layout } from 'tapis-app/components';
import {
  SectionBody,
  SectionNavWrapper,
  SectionHeader,
} from 'tapis-app/components/Section';
import { SystemsNav } from '../components';
import { Router } from '../Router';

const Systems: React.FC = () => {
  const header = (
    <SectionHeader>
      <div>System List</div>
    </SectionHeader>
  );

  const subHeader = <SectionHeader type={'sub-header'}>Files</SectionHeader>;

  const sidebar = (
    <SectionNavWrapper>
      <SystemsNav />
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

export default Systems;
