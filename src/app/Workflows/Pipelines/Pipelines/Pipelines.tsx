import React from 'react';
import { SectionMessage } from '@tapis/tapisui-common';
import { PipelineCardList } from 'app/Workflows/_components';
import styles from './Pipelines.module.scss';

type PipelinesProps = {
  groupId?: string;
};

const Pipelines: React.FC<PipelinesProps> = ({ groupId }) => {
  return (
    <div id="pipelines" className={styles['container']}>
      {groupId ? (
        <div>
          <PipelineCardList columns={1} cardsPerPage={4} groupId={groupId} />
        </div>
      ) : (
        <SectionMessage type="info">
          Select a group to view pipelines
        </SectionMessage>
      )}
    </div>
  );
};

export default Pipelines;
