import { Component } from '@tapis/tapisui-extensions-core';

export const CKNDashboard: Component = () => {
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
        src={`https://ckn.d2i.tacc.cloud/`}
      />
    </div>
  );
};

export default CKNDashboard;
