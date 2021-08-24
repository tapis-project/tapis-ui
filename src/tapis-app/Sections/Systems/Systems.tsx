import React, { useState, useCallback } from 'react';
import { SystemList } from 'tapis-ui/components/systems';
import { FileListing } from 'tapis-ui/components/files';
import { TapisSystem } from '@tapis/tapis-typescript-systems';
import { SectionMessage, Icon } from 'tapis-ui/_common';
import { 
  ListSection, 
  ListSectionBody, 
  ListSectionDetail,
  ListSectionList,
  ListSectionHeader
} from 'tapis-app/Sections/ListSection';
import { useList } from 'tapis-hooks/systems';

const Systems: React.FC = () => {
  const [selectedSystem, setSelectedSystem] = useState<TapisSystem | null>(null);
  const { refetch } = useList();
  const systemSelectCallback = useCallback(
    (system: TapisSystem) => {
      /* eslint-disable */
      setSelectedSystem(system);
    },
    [setSelectedSystem]
  )
  const refresh = () => {
    setSelectedSystem(null);
    refetch(); 
  }

  return (
    <ListSection>
      <ListSectionHeader>
        <div>
          System List
          &nbsp;
          <span className="btn-head" onClick={refresh}>
            <Icon name="refresh" />
          </span>
        </div>
      </ListSectionHeader>
      <ListSectionBody>
        <ListSectionList>
          <SystemList onSelect={systemSelectCallback} />
        </ListSectionList>
        <ListSectionDetail>
          <ListSectionHeader type={"sub-header"}>Files</ListSectionHeader>
          {selectedSystem
            ? <FileListing systemId={selectedSystem.id || ''} path={'/'} />
            : <SectionMessage type="info">
                Select a system from the list.
              </SectionMessage>
          }
        </ListSectionDetail>
      </ListSectionBody>
    </ListSection>
  )
}

export default Systems;