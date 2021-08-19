import React, { useState, useCallback } from 'react';
import { useList } from 'tapis-hooks/apps';
import { LoadingSpinner, Message, Icon } from 'tapis-ui/_common';
import { Apps } from '@tapis/tapis-typescript';
import './AppsListing.scss';

interface AppsListingItemProps {
  app: Apps.TapisApp,
  onSelect: Function
  selected: boolean,
}

const AppsListingItem: React.FC<AppsListingItemProps> = ({ app, onSelect, selected = false }) => {
  return (
    <li className="nav-item">
      <div className={"nav-link" + (selected ? ' active' : '')}>
        <div className="nav-content" onClick={() => onSelect(app) }>
          <Icon name="applications" /> {/* we'll want to set name based on the app */}
          <span className="nav-text">{`${app.id} v${app.version}`}</span>
        </div>
      </div>
    </li>
  );
};

interface AppsListingProps {
  onSelect?: (app: Apps.TapisApp) => any,
  className?: string
  select?: string | undefined
}

const AppsListing: React.FC<AppsListingProps> = ({
    onSelect=undefined, className, select=undefined
  }) => {

  const { data, isLoading, error } = useList({ select })
  const [currentApp, setCurrentApp] = useState(String);
  const selectCallback = useCallback((app) => {
    onSelect && onSelect(app);
    setCurrentApp(app.id)
  },[onSelect, setCurrentApp]);

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
                  selected={currentApp === app.id}
                  onSelect={selectCallback}
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
