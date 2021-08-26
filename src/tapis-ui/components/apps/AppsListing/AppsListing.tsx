import React from 'react';
import { NavLink, useRouteMatch } from 'react-router-dom'
import { useList } from 'tapis-hooks/apps';
import { LoadingSpinner, Message, Icon } from 'tapis-ui/_common';
import { Apps } from '@tapis/tapis-typescript';
import './AppsListing.scss';

interface AppsListingItemProps {
  app: Apps.TapisApp,
}

const AppsListingItem: React.FC<AppsListingItemProps> = ({ app }) => {
  const { url } = useRouteMatch();
  return (
    <li className="nav-item">
      <NavLink to={`${url}/${app.id}/${app.version}`} className={"nav-link"} activeClassName={"active"}>
        <div className="nav-content">
          <Icon name="applications" /> {/* we'll want to set name based on the app */}
          <span className="nav-text">{`${app.id} v${app.version}`}</span>
        </div>
      </NavLink>
    </li>
  );
};

interface AppsListingProps {
  className?: string,
}

const AppsListing: React.FC<AppsListingProps> = ({ className }) => {

  const { data, isLoading, error } = useList()

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (error) {
    return <Message canDismiss={false} type="error" scope="inline">{(error as any).message}</Message>
  }

  const appList: Array<Apps.TapisApp> = data?.result || [];

  return (
    <div className={className ? className : "apps-list nav flex-column"}>
      { 
        appList.length
          ? appList.map((app: Apps.TapisApp | null) => {
              return app && (
                <AppsListingItem
                  app={app}
                  key={app.id}
                />
              )
            })
          : <i>No applications found</i>
      }
    </div>
  );
};

export default AppsListing;
