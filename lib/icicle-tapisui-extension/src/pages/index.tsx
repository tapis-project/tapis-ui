import * as React from 'react';
import { SectionHeader } from '@tapis/tapisui-common';

export const MLEdgePage: React.FC = () => {
  return (
    <div>
      <SectionHeader>ML Edge</SectionHeader>
    </div>
  );
};

export const SmartSchedulerPage: React.FC = () => {
  return (
    <div>
      <SectionHeader>Smart Scheduler</SectionHeader>
    </div>
  );
};

export const JupyterLabPage: React.FC = () => {
  return (
    <div>
      <SectionHeader>Jupyter Lab</SectionHeader>
      <iframe style={{width: "100%", height: "800px", border: "none"}} src="https://jupyterlab.pods.tacc.develop.tapis.io/" />
    </div>
  );
};

export const OpenWebUIPage: React.FC = () => {
  return (
    <div style={{width: "100%", height: "100%", display: "flex", flexDirection: "column", overflow: "hidden"}}>
      <SectionHeader>Open Web UI</SectionHeader>
      <iframe style={{flexGrow: 1, border: "none"}} src="https://openwebui.pods.tacc.develop.tapis.io/" />
    </div>
  );
};
