import * as React from 'react';

export const Patra: React.FC = () => {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <iframe
        style={{ flexGrow: 1, border: 'none' }}
        src="https://patra.pods.icicleai.tapis.io"
      />
    </div>
  );
};

export default Patra;
