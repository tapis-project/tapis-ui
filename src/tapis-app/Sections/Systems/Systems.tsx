import React from 'react';
import {
  Route,
  Switch,
  useRouteMatch,
  RouteComponentProps
} from 'react-router-dom';
import { SystemList } from 'tapis-ui/components/systems';
import { FileListing } from 'tapis-ui/components/files';
import { SectionMessage } from 'tapis-ui/_common';
import {
  ListSection,
  ListSectionBody,
  ListSectionDetail,
  ListSectionList,
  ListSectionHeader
} from 'tapis-app/Sections/ListSection';

const Systems: React.FC = () => {
  const { path } = useRouteMatch();

  return (
    <ListSection>
      <ListSectionHeader>
        <div>System List</div>
      </ListSectionHeader>
      <ListSectionBody>
        <ListSectionList>
          <SystemList />
        </ListSectionList>
        <ListSectionDetail>
          <ListSectionHeader type={'sub-header'}>Files</ListSectionHeader>
          <Switch>
            <Route path={`${path}`} exact>
              <SectionMessage type="info">
                Select a system from the list.
              </SectionMessage>
            </Route>

            <Route
              path={`${path}/:systemId`}
              render={({
                match
              }: RouteComponentProps<{ systemId: string }>) => (
                <FileListing systemId={match.params.systemId} path={'/'} />
              )}
            />
          </Switch>
        </ListSectionDetail>
      </ListSectionBody>
    </ListSection>
  );
};

export default Systems;
