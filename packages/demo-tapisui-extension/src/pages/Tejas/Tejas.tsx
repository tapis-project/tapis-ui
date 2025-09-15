import * as React from 'react';
import { SectionHeader } from '@tapis/tapisui-common';

export const Tejas: React.FC = () => {
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
        src="https://tejas.tacc.utexas.edu/"
      />
    </div>
  );
};

export default Tejas;
