import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useApps } from 'tapis-redux';
import { AppsListCallback } from 'tapis-redux/apps/list/types';
import { Config, TapisState } from 'tapis-redux/types';
import { LoadingSpinner, Icon } from 'tapis-ui/_common';
import { Apps } from '@tapis/tapis-typescript';
import './AppsListing.scss';

export type OnSelectCallback = (app: Apps.TapisApp) => any;

interface AppsListingItemProps {
  app: Apps.TapisApp,
  select: Function
  selected: boolean,
}

const AppsListingItem: React.FC<AppsListingItemProps> = ({ app, select, selected }) => {
  return (
    <li className="nav-item">
      <div className={"nav-link" + (selected ? ' active' : '')}>
        <div className="nav-content" onClick={() => select(app) }>
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
}

const AppsListing: React.FC<AppsListingProps> = ({ config, onList, onSelect, className }) => {
  const dispatch = useDispatch();
  const { list, apps } = useApps(config);
  useEffect(() => {
    dispatch(list({ onList }));
  }, [dispatch, onList]);
  const [currentApp, setCurrentApp] = useState(String);
  const select = useCallback((app) => {
    onSelect(app);
    setCurrentApp(app.id)
  },[onSelect, setCurrentApp]);

  if (!apps || apps.loading) {
    return <LoadingSpinner />
  }

  const appList: Array<Apps.TapisApp> = apps.results;

  return (
    <div className={className ? className : "apps-list nav flex-column"}>
      {
        appList.map((app: Apps.TapisApp) => {
          return (
            <AppsListingItem
              app={app}
              selected={currentApp === app.id}
              select={select}
            />
          )
        })
      }
    </div>
  );
};

AppsListing.defaultProps = {
  config: null,
  onList: null,
  onSelect: null
}

export default AppsListing;
