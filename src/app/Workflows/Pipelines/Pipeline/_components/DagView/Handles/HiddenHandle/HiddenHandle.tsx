import React from 'react';
import { Handle as RFHandle, HandleProps } from '@xyflow/react';

const HiddenHandle: React.FC<HandleProps> = ({ id, position, type }) => {
  return (
    <RFHandle
      id={id}
      type={type}
      position={position}
      style={{
        display: 'none',
        // border: '1px solid #000000',
        // height: '16px',
        // width: '16px',
        // backgroundColor: '#FFFFFF',
      }}
    />
  );
};

export default HiddenHandle;
