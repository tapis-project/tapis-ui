import React, { useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useApps } from 'tapis-redux';
import { AppsListCallback } from 'tapis-redux/apps/list/types';
import { Config, TapisState } from 'tapis-redux/types';
import { Apps } from '@tapis/tapis-typescript';

export type OnSelectCallback = (app: Apps.TapisApp) => any;

interface AppsListingItemProps {
  app: Apps.TapisApp,
  onSelect?: OnSelectCallback
}

const AppsListingItem: React.FC<AppsListingItemProps> = ({ app, onSelect }) => {
  return (
    <div onClick={() => onSelect(app)}>
      {`${app.id} v${app.version}`}
    </div>
  );
};

AppsListingItem.defaultProps = {
  onSelect: null
}

interface AppsListingProps {
  config?: Config,
  onList?: AppsListCallback,
  onSelect?: OnSelectCallback
}

const AppsListing: React.FC<AppsListingProps> = ({ config, onList, onSelect }) => {
  const dispatch = useDispatch();

  // Get a file listing given the systemId and path
  const { list, apps } = useApps(config);
  useEffect(() => {
    dispatch(list({ onList }));
  }, [dispatch, onList]);

  const appSelectCallback = useCallback<OnSelectCallback>(
    (app: Apps.TapisApp) => {
      if (onSelect) {
        onSelect(app);
      }
    },
    [onSelect]
  )

  if (!apps || apps.loading) {
    return (
      <div>
        Loading...
      </div>
    )
  }

  const appList: Array<Apps.TapisApp> = apps.results;

  return (
    <div>
      {
        appList.map((app: Apps.TapisApp) => {
          return (
            <AppsListingItem app={app} onSelect={appSelectCallback}/>
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
