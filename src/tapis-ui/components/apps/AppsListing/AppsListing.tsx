import React from 'react';
import { useRouteMatch } from 'react-router-dom';
import { useList } from 'tapis-hooks/apps';
import { LoadingSpinner, Message } from 'tapis-ui/_common';
import { Apps } from '@tapis/tapis-typescript';
import { Navbar, NavItem } from 'tapis-ui/components/Navbar';

const AppsListing: React.FC = () => {
  const { data, isLoading, error } = useList();
  const { url } = useRouteMatch();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <Message canDismiss={false} type="error" scope="inline">
        {(error as any).message}
      </Message>
    );
  }

  const appList: Array<Apps.TapisApp> = data?.result || [];

  return (
    <Navbar>
      {appList.length ? (
        appList.map((app: Apps.TapisApp | null) => {
          return (
            app && (
              <NavItem
                to={`${url}/${app.id}/${app.version}`}
                icon="applications"
                key={app.id}
              >{`${app.id} v${app.version}`}</NavItem>
            )
          );
        })
      ) : (
        <i>No applications found</i>
      )}
    </Navbar>
  );
};

export default AppsListing;
