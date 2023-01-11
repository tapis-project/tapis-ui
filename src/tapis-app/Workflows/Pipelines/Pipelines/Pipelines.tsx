import React from 'react';
import { SectionMessage } from 'tapis-ui/_common';
import { PipelineList } from './_components';

type PipelinesProps = {
  groupId?: string;
};

const Pipelines: React.FC<PipelinesProps> = ({ groupId }) => {
  return (
    <div id="pipelines">
      {groupId ? (
        <div>
          <PipelineList groupId={groupId} />
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
