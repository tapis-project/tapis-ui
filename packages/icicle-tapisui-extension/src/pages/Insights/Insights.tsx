import * as React from 'react';
import { Component } from '@tapis/tapisui-extensions-core';

export const Insights: Component = ({ accessToken }) => {
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
          src="https://insights.pods.icicleai.tapis.io"
          title="ICICLE Insights"
        />
      ) : (
        <>Invalid JWT. Log out of TapisUI then log back in</>
      )}
    </div>
  );
};

export default Insights;
