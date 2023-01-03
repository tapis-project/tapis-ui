import React from 'react';
import { SectionMessage } from 'tapis-ui/_common';
import { ArchiveList } from '../_components';

type ArchivesProps = {
  groupId?: string;
};

const Archives: React.FC<ArchivesProps> = ({ groupId }) => {
  return (
    <div id="archives">
      {groupId ? (
        <div>
          <ArchiveList groupId={groupId} />
        </div>
      ) : (
        <SectionMessage type="info">
          Select a group to view archives
        </SectionMessage>
      )}
    </div>
  );
};

export default Archives;
