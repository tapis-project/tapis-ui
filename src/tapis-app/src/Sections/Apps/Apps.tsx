import React, { useState, useCallback } from 'react';
import { TapisApp } from '@tapis/tapis-typescript-apps';
import { AppsListing } from 'tapis-ui/components/apps';
import { OnSelectCallback } from 'tapis-ui/components/apps/AppsListing';
import { 
  ListSection, 
  ListSectionBody, 
  ListSectionDetail,
  ListSectionList,
  ListSectionHeader
} from 'tapis-app/Sections/ListSection';

const Apps: React.FC = () => {
  const [selectedApp, setSelectedApp] = useState<TapisApp>(null);
  const appSelectCallback = useCallback<OnSelectCallback>(
    (app: TapisApp) => {
      setSelectedApp(app);
    },
    [ setSelectedApp ]
  )

  return (
    <ListSection>
      <ListSectionHeader>Apps</ListSectionHeader>
      <ListSectionBody>
        <ListSectionList>
          <AppsListing />
        </ListSectionList>
        <ListSectionDetail>
          <div>
            {selectedApp ? selectedApp.id : "Select an app from the list"}
          </div>
        </ListSectionDetail>
      </ListSectionBody>
    </ListSection>
  )
}

export default Apps;