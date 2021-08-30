import React from 'react';
import {
  Route,
  Switch,
  useRouteMatch,
  RouteComponentProps
} from 'react-router-dom';
import { JobsListing } from 'tapis-ui/components/jobs';
import { JobDetail } from 'tapis-ui/components/jobs';
import { SectionMessage } from 'tapis-ui/_common';
import { 
  ListSection, 
  ListSectionBody, 
  ListSectionDetail,
  ListSectionList,
  ListSectionHeader
} from 'tapis-app/Sections/ListSection';

const Jobs: React.FC = () => {

  const { path } = useRouteMatch();

  return (
    <ListSection>
      <ListSectionHeader>
      <div>
        Jobs
      </div>
      </ListSectionHeader>
      <ListSectionBody>
        <ListSectionList>
          <JobsListing />
        </ListSectionList>
        <ListSectionDetail>
          <ListSectionHeader type={"sub-header"}>Job Details</ListSectionHeader>
          <Switch>
            <Route path={`${path}`} exact>
              <SectionMessage type="info">
                Select a job from the list.
              </SectionMessage>
            </Route>

            <Route
              path={`${path}/:jobUuid`}
              render={({
                match: {params: {jobUuid}}
              }: RouteComponentProps<{ jobUuid: string }>) => (
                <JobDetail jobUuid={jobUuid}/>
              )}
            />
          </Switch>
        </ListSectionDetail>
      </ListSectionBody>
    </ListSection>
  )
}

export default Jobs;