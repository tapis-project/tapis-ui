import * as React from 'react';
import { SectionHeader } from '@tapis/tapisui-common';
import { Component } from '@tapis/tapisui-extensions-core';
// export { JupyterLab } from './JupyterLab';
// import { OpenWebUI } from './OpenWebUI';
// export { MLEdge } from './MLEdge';
// export { SmartScheduler } from './SmartScheduler';

export const DataLabeler: React.FC = () => {
  return (
    <div>
      <SectionHeader>Data Labeler</SectionHeader>
    </div>
  );
};

export const JupyterLab: React.FC = () => {
  return (
    <div>
      <SectionHeader>Jupyter Lab</SectionHeader>
      <iframe
        style={{ width: '100%', height: '800px', border: 'none' }}
        src="https://jupyterlab.pods.tacc.develop.tapis.io/"
      />
    </div>
  );
};

export const MLEdge: React.FC = () => {
  return (
    <div>
      <SectionHeader>ML Edge</SectionHeader>
    </div>
  );
};

export const OpenWebUI: React.FC = () => {
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
        src="https://openwebui.pods.tacc.develop.tapis.io/"
      />
    </div>
  );
};

export const DigitalAg: React.FC = () => {
  return (
    <div>
      <SectionHeader>Digital Ag</SectionHeader>
    </div>
  );
};

export const SmartScheduler: React.FC = () => {
  return (
    <div>
      <SectionHeader>Smart Scheduler</SectionHeader>
    </div>
  );
};

export const VisualAnalytics: Component = ({ accessToken }) => {
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
      {accessToken ? (
        <iframe
          style={{ flexGrow: 1, border: 'none' }}
          src={`https://vaapibackenddev.pods.icicle.tapis.io/tapisui-entry?jwt=${accessToken}`}
        />
      ) : (
        <>Invalid JWT. Log out of TapisUI then log back in</>
      )}
    </div>
  );
};
