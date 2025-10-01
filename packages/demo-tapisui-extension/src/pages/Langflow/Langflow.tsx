import * as React from 'react';
import { SectionHeader } from '@tapis/tapisui-common';

export const Langflow: React.FC = () => {
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
        id="Tejas"
        title="Tejas Chat"
        src="https://langflow.pods.tacc.develop.tapis.io/"
      />
    </div>
  );
};

export default Langflow;
