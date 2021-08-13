import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useApps } from 'tapis-redux/src';
import { AppsListCallback } from 'tapis-redux/src/apps/list/types';
import { Config, TapisState } from 'tapis-redux/src/types';
import { LoadingSpinner, Message, Icon } from 'tapis-ui/src/_common';
import { Apps } from '@tapis/tapis-typescript';
import './AppsListing.scss';

export type OnSelectCallback = (app: Apps.TapisApp) => any;

interface AppsListingItemProps {
  app: Apps.TapisApp,
  onSelect: Function
  selected: boolean,
}

const AppsListingItem: React.FC<AppsListingItemProps> = ({ app, onSelect, selected }) => {
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

AppsListingItem.defaultProps = {
  selected: false
}

interface AppsListingProps {
  config?: Config,
  onList?: AppsListCallback,
  onSelect?: OnSelectCallback,
  className?: string
  select?: string
}

const AppsListing: React.FC<AppsListingProps> = ({ config, onList, onSelect, className, select }) => {
  const dispatch = useDispatch();
  const { list, apps } = useApps(config);
  useEffect(() => {
    dispatch(list({ onList, request: { select } }));
  }, [dispatch, onList]);
  const [currentApp, setCurrentApp] = useState(String);
  const selectCallback = useCallback((app) => {
    onSelect && onSelect(app);
    setCurrentApp(app.id)
  },[onSelect, setCurrentApp]);

  if (!apps || apps.loading) {
    return <LoadingSpinner />
  }

  if (apps.error) {
    return <Message canDismiss={false} type="error" scope="inline">{apps.error.message}</Message>
  }

  const appList: Array<Apps.TapisApp |null> = apps.results;

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

AppsListing.defaultProps = {
  config: undefined,
  onList: undefined,
  onSelect: undefined,
  select: ""
}

export default AppsListing;
