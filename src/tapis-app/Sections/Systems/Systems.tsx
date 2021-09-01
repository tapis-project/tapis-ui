import React from 'react';
import { Route, useRouteMatch, RouteComponentProps } from 'react-router-dom';
import { SystemsNav } from 'tapis-ui/components/systems';
import { FileListing } from 'tapis-ui/components/files';
import { SectionMessage } from 'tapis-ui/_common';
import { Layout } from 'tapis-app/Layout';
import {
  SectionBody,
  SectionNavWrapper,
  SectionHeader,
} from 'tapis-app/Sections/Section';

const Systems: React.FC = () => {
  const { path } = useRouteMatch();

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
      <Route path={`${path}`} exact>
        <SectionMessage type="info">
          Select a system from the list.
        </SectionMessage>
      </Route>

      <Route
        path={`${path}/:systemId`}
        render={({
          match: {
            params: { systemId },
          },
        }: RouteComponentProps<{ systemId: string }>) => (
          <FileListing systemId={systemId} path={'/'} />
        )}
      />
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
