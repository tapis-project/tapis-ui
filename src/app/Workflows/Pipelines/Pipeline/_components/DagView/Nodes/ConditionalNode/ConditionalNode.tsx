import React from 'react';
import { Position, NodeProps } from '@xyflow/react';
import styles from './ConditionalNode.module.scss';
import { StandardHandle } from '../../Handles';
import { Workflows } from '@tapis/tapis-typescript';
import { Edit } from '@mui/icons-material';

type NodeType = {
  task: Workflows.Task;
  groupId: string;
  pipelineId: string;
};

const conditionalImageSrc =
  'data:image/jpeg;base64,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';

const ConditionalNode: React.FC<NodeProps> = ({ data }) => {
  const { task } = data as NodeType;
  return (
    <>
      <StandardHandle
        id={`conditional-target-handle-${task.id}`}
        type="target"
        position={Position.Left}
      />
      <div className={styles['node']}>
        <div className={styles['header']}>
          <img src={conditionalImageSrc} className={styles['header-img']} />
          <span className={styles['title']}>Condition: {task.id}</span>
        </div>
        <div className={styles['body']}>
          <i className={styles['description']}>
            Conditional expressions that control task execution
          </i>
        </div>
        <div className={styles['footer']}>
          <Edit className={styles['action']} />
        </div>
      </div>
      <StandardHandle
        id={`conditional-source-handle-${task.id}`}
        type="source"
        position={Position.Right}
      />
    </>
  );
};

export default ConditionalNode;
