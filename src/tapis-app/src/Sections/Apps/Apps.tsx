import React, { useState, useCallback } from 'react';
import { TapisApp } from '@tapis/tapis-typescript-apps';
import { AppsListing } from 'tapis-ui/components/apps';
import { OnSelectCallback } from 'tapis-ui/components/apps/AppsListing';
import ListSection from 'tapis-app/ListSection';

const Apps: React.FC = () => {
  const [selectedApp, setSelectedApp] = useState<TapisApp>(null);
  const appSelectCallback = useCallback<OnSelectCallback>(
    (app: TapisApp) => {
      setSelectedApp(app);
    },
    [ setSelectedApp ]
  )

  const list = <AppsListing />

  const detail = (
    <div>
      {selectedApp ? selectedApp.id : "Select an app from the list"}
    </div>
  )

  return (
    <ListSection
      name="Apps"
      list={list}
      detail={detail}
    />
  )
}

export default Apps;