import React from 'react';
import { Position, NodeProps } from '@xyflow/react';
import { HiddenHandle } from '../../Handles';

const LayoutNode: React.FC<NodeProps> = ({ id, data }) => {
  return (
    <>
      {!data.isLayoutRoot && (
        <HiddenHandle
          key={`${id}-layout-target`}
          id={`${id}-layout-target`}
          type="target"
          position={Position.Left}
        />
      )}
      <div />
      <HiddenHandle
        key={`${id}-layout-source`}
        id={`${id}-layout-source`}
        type="source"
        position={Position.Right}
      />
    </>
  );
};

export default LayoutNode;
