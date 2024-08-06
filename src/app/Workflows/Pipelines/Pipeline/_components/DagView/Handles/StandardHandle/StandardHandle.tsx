import React from 'react';
import { Handle as RFHandle, HandleProps } from '@xyflow/react';

const StandardHandle: React.FC<HandleProps> = ({
  id,
  position,
  type,
  style,
}) => {
  return (
    <RFHandle
      id={id}
      type={type}
      position={position}
      style={{
        border: '1px solid #000000',
        height: '16px',
        width: '16px',
        backgroundColor: '#FFFFFF',
        ...style,
      }}
    />
  );
};

export default StandardHandle;
