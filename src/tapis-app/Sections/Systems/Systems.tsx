import React, { useState, useCallback } from 'react';
import { SystemList } from 'tapis-ui/components/systems';
import { FileListing } from 'tapis-ui/components/files';
import { TapisSystem } from '@tapis/tapis-typescript-systems';
import { SectionMessage } from 'tapis-ui/_common';
import { 
  ListSection, 
  ListSectionBody, 
  ListSectionDetail,
  ListSectionList,
  ListSectionHeader
} from 'tapis-app/Sections/ListSection';

const Systems: React.FC = () => {
  const [selectedSystem, setSelectedSystem] = useState<TapisSystem | null>(null);
  const systemSelectCallback = useCallback(
    (system: TapisSystem) => {
      /* eslint-disable */
      setSelectedSystem(system);
    },
    [setSelectedSystem]
  )

  return (
    <ListSection>
      <ListSectionHeader>
        <div>
          System List
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