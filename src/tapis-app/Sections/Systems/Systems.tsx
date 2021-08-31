import React from 'react';
import {
  Route,
  useRouteMatch,
  RouteComponentProps
} from 'react-router-dom';
import { SystemsNav } from 'tapis-ui/components/systems';
import { FileListing } from 'tapis-ui/components/files';
import { SectionMessage } from 'tapis-ui/_common';
import { Layout } from 'tapis-app/Layout';
import {
  ListSectionDetail,
  ListSectionList,
  ListSectionHeader
} from 'tapis-app/Sections/ListSection';

const Systems: React.FC = () => {
  const { path } = useRouteMatch();

  const header = (
    <ListSectionHeader>
      <div>System List</div>
    </ListSectionHeader>
  );

  const subHeader = (
    <ListSectionHeader type={'sub-header'}>Files</ListSectionHeader>
  );

  const sidebar = (
    <ListSectionList>
      <SystemsNav />
    </ListSectionList>
  );

  const body = (
    <div style={{ flex: 1 }}>
      <ListSectionDetail>
        <Route path={`${path}`} exact>
          <SectionMessage type="info">
            Select a system from the list.
          </SectionMessage>
        </Route>

        <Route
          path={`${path}/:systemId`}
          render={({
            match: {
              params: { systemId }
            }
          }: RouteComponentProps<{ systemId: string }>) => (
            <FileListing systemId={systemId} path={'/'} />
          )}
        />
      </ListSectionDetail>
    </div>
  );

  return (
    <Layout
      top={header}
      left={sidebar}
      right={<Layout top={subHeader} right={body} />}
    />
  );
};

export default Systems;
