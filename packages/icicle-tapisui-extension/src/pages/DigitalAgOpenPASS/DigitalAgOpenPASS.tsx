import * as React from 'react';
import { SectionHeader } from '@tapis/tapisui-common';

export const DigitalAgOpenPASS: React.FC = () => {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'scroll',
      }}
    >
      <iframe
        style={{ flexGrow: 1, border: 'none' }}
        id="OpenPASS"
        title="ICICLE OpenPASS"
        src="https://go.osu.edu/icicle-installopenpass"
      />
    </div>
  );
};

export default DigitalAgOpenPASS;
