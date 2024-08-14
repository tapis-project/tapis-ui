import * as React from 'react';
import { SectionHeader } from '@tapis/tapisui-common';

const JupyterLab: React.FC = () => {
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
        src="https://jupyterlab.pods.tacc.develop.tapis.io/"
      />
    </div>
  );
};

export default JupyterLab;
