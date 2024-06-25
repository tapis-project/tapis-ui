import React from 'react';
import { SectionMessage } from '@tapis/tapisui-common';
import { ArchiveList } from '../_components';
import styles from './Archives.module.scss';

type ArchivesProps = {
  groupId?: string;
};

const Archives: React.FC<ArchivesProps> = ({ groupId }) => {
  return (
    <div id="archives" className={styles['container']}>
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
