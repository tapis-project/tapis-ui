import * as React from 'react';
import { Component } from '@tapis/tapisui-extensions-core';

// Insights serves the same dashboard signed in or out, so it renders the
// frame directly instead of going through SignedInPortal — no sign-in wall
// in front of public content (it is in the extension's prelogin sidebar).
export const Insights: Component = () => (
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
      src="https://insights.pods.icicleai.tapis.io"
      title="ICICLE Insights"
    />
  </div>
);

export default Insights;
