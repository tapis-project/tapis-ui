import React from 'react';
import { Position, NodeProps } from '@xyflow/react';
import { HiddenHandle } from '../../Handles';

const LayoutNode: React.FC<NodeProps> = ({ id }) => {
  return (
    <>
      <HiddenHandle
        key={`${id}-layout-target`}
        id={`${id}-layout-target`}
        type="target"
        position={Position.Left}
      />
      <div />
      <HiddenHandle
        key={`${id}-layout-source`}
        id={`${id}-layout-source`}
        type="source"
        position={Position.Right}
      />
      <HiddenHandle
        key={`${id}-layout-top-source`}
        id={`${id}-layout-top-source`}
        type="source"
        position={Position.Top}
      />
      <HiddenHandle
        key={`${id}-layout-bottom-target`}
        id={`${id}-layout-bottom-target`}
        type="target"
        position={Position.Bottom}
      />
    </>
  );
};

export default LayoutNode;
