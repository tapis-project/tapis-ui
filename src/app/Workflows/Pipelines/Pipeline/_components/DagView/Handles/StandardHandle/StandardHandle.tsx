import React from 'react';
import { Handle as RFHandle, HandleProps } from '@xyflow/react';

const StandardHandle: React.FC<HandleProps> = ({ position, type }) => {
  return (
    <RFHandle
      type={type}
      position={position}
      style={{
        border: '1px solid #000000',
        height: '16px',
        width: '16px',
        backgroundColor: '#FFFFFF',
      }}
    />
  );
};

export default StandardHandle;
